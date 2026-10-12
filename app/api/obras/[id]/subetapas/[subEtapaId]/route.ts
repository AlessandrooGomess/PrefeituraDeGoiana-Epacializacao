import { NextResponse } from "next/server";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { canManageObra } from "@/lib/auth/obra-access";
import { calcularMediaPonderada, statusPorPercentual } from "@/lib/obras/progresso";

interface RouteContext {
  params: Promise<{ id: string; subEtapaId: string }>;
}

const bodySchema = z.object({ concluida: z.boolean() });

export async function PATCH(request: Request, context: RouteContext) {
  const { id, subEtapaId } = await context.params;

  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(subEtapaId).success) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  }
  const { concluida } = body.data;

  try {
    // Sessão e dados da obra em paralelo: 1 ida ao banco em vez de várias em sequência
    const [auth, obra] = await Promise.all([
      requireUser([Role.SUPER_ADMIN, Role.ENGENHEIRO]),
      prisma.obra.findUnique({
        where: { id },
        select: {
          secretariaId: true,
          engenheiroId: true,
          deletedAt: true,
          status: true,
          etapasObra: {
            select: {
              id: true,
              percentualConcluido: true,
              etapaTemplate: { select: { peso: true } },
              subEtapasObra: {
                select: {
                  id: true,
                  percentualConcluido: true,
                  subEtapaTemplate: { select: { peso: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    if (auth.response) return auth.response;

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

    // Garante que a sub-etapa pertence a ESTA obra
    const etapa = obra.etapasObra.find((e) => e.subEtapasObra.some((s) => s.id === subEtapaId));
    if (!etapa) {
      return NextResponse.json({ message: "Sub-etapa não encontrada nesta obra." }, { status: 404 });
    }

    const novoPercentualSub = concluida ? 100 : 0;
    const novoStatusSub = concluida ? "CONCLUIDA" : "PENDENTE";

    const novoPercentualEtapa = calcularMediaPonderada(
      etapa.subEtapasObra.map((sub) => ({
        percentual: sub.id === subEtapaId ? novoPercentualSub : Number(sub.percentualConcluido),
        peso: sub.subEtapaTemplate.peso,
      })),
    );
    const novoStatusEtapa = statusPorPercentual(novoPercentualEtapa);

    const progressoGeral = calcularMediaPonderada(
      obra.etapasObra.map((e) => ({
        percentual: e.id === etapa.id ? novoPercentualEtapa : Number(e.percentualConcluido),
        peso: e.etapaTemplate.peso,
      })),
    );

    const agora = new Date();
    await prisma.$transaction([
      prisma.subEtapaObra.update({
        where: { id: subEtapaId },
        data: {
          status: novoStatusSub,
          percentualConcluido: novoPercentualSub,
          dataConclusao: concluida ? agora : null,
        },
        select: { id: true },
      }),
      prisma.etapaObra.update({
        where: { id: etapa.id },
        data: {
          percentualConcluido: novoPercentualEtapa,
          status: novoStatusEtapa,
          dataConclusao: novoStatusEtapa === "CONCLUIDA" ? agora : null,
        },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      subEtapa: { id: subEtapaId, status: novoStatusSub, percentualConcluido: novoPercentualSub },
      etapa: { id: etapa.id, status: novoStatusEtapa, percentualConcluido: novoPercentualEtapa },
      progressoGeral,
    });
  } catch (error) {
    console.error("Erro ao atualizar sub-etapa:", error);
    return NextResponse.json({ message: "Erro interno ao atualizar sub-etapa." }, { status: 500 });
  }
}