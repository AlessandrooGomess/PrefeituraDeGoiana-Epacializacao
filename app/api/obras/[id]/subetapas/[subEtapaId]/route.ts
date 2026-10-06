import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { canManageObra } from "@/lib/auth/obra-access";
import { Role } from "@prisma/client";
import { calcularProgressoObra } from "@/lib/obras/calcular-progresso";

interface RouteContext {
  params: Promise<{ id: string; subEtapaId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, subEtapaId } = await context.params;

  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(subEtapaId).success) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  const auth = await requireUser([Role.SUPER_ADMIN, Role.ENGENHEIRO]);
  if (auth.response) return auth.response;

  try {
    const obra = await prisma.obra.findUnique({
      where: { id },
      select: { secretariaId: true, engenheiroId: true, deletedAt: true, status: true },
    });

    if (!obra || obra.deletedAt) {
      return NextResponse.json({ message: "Obra não encontrada." }, { status: 404 });
    }

    if (!canManageObra(auth.user, obra)) {
      return NextResponse.json({ message: "Você não tem permissão para alterar esta obra." }, { status: 403 });
    }

    if (obra.status === "PLANEJADA" || obra.status === "ORDEM_EMITIDA") {
      return NextResponse.json(
        { message: "A evolução física só pode ser alterada após a obra entrar em andamento." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { concluida } = z.object({ concluida: z.boolean() }).parse(body);

    const subEtapaAtualizada = await prisma.subEtapaObra.update({
      where: { id: subEtapaId },
      data: {
        status: concluida ? "CONCLUIDA" : "PENDENTE",
        percentualConcluido: concluida ? 100 : 0,
        dataConclusao: concluida ? new Date() : null,
      },
      include: { etapaObra: true }
    });

    const etapaId = subEtapaAtualizada.etapaObraId;
    const todasSubEtapas = await prisma.subEtapaObra.findMany({
      where: { etapaObraId: etapaId },
      include: { subEtapaTemplate: { select: { peso: true } } }
    });

    let somaPonderada = 0;
    let somaPesos = 0;
    for (const sub of todasSubEtapas) {
      somaPesos += sub.subEtapaTemplate.peso;
      somaPonderada += Number(sub.percentualConcluido) * sub.subEtapaTemplate.peso;
    }

    const novoPercentualEtapa = somaPesos === 0 ? 0 : Math.round((somaPonderada / somaPesos) * 100) / 100;
    const etapaConcluida = novoPercentualEtapa === 100;

    const etapaAtualizada = await prisma.etapaObra.update({
      where: { id: etapaId },
      data: {
        percentualConcluido: novoPercentualEtapa,
        status: etapaConcluida ? "CONCLUIDA" : (novoPercentualEtapa > 0 ? "EM_ANDAMENTO" : "PENDENTE"),
        dataConclusao: etapaConcluida ? new Date() : null,
      }
    });

    // 3. Recalcula Progresso Geral da Obra
    const progressoGeral = await calcularProgressoObra(id);

    return NextResponse.json({
      subEtapa: { ...subEtapaAtualizada, percentualConcluido: Number(subEtapaAtualizada.percentualConcluido) },
      etapa: { ...etapaAtualizada, percentualConcluido: Number(etapaAtualizada.percentualConcluido) },
      progressoGeral
    });

  } catch (error) {
    console.error("Erro ao atualizar sub-etapa:", error);
    return NextResponse.json({ message: "Erro interno ao atualizar sub-etapa." }, { status: 500 });
  }
}