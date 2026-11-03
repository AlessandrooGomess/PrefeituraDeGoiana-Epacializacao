import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { canManageObra } from "@/lib/auth/obra-access";
import { Prisma, Role } from "@prisma/client";
import { calcularProgressoObra } from "@/lib/obras/calcular-progresso";

interface RouteContext {
  params: Promise<{ id: string; etapaId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, etapaId } = await context.params;

  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(etapaId).success) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  // Apenas Engenheiro e Admin podem marcar etapas
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "O corpo da requisição deve conter um JSON válido." }, { status: 400 });
    }

    const updateSchema = z.object({
      concluida: z.boolean(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: "Dados inválidos.", errors: result.error.issues }, { status: 400 });
    }

    const { concluida } = result.data;

    // Atualiza a etapa: se concluida = true, marca 100% e CONCLUIDA
    // Se concluida = false (engenheiro desmarcou), volta para 0% e PENDENTE
    const etapaAtualizada = await prisma.etapaObra.update({
      where: { id: etapaId, obraId: id },
      data: {
        status: concluida ? "CONCLUIDA" : "PENDENTE",
        percentualConcluido: concluida ? 100 : 0,
        dataConclusao: concluida ? new Date() : null,
      },
    });

    // Recalcula o progresso geral da obra automaticamente
    const progressoGeral = await calcularProgressoObra(id);

    return NextResponse.json(
      {
        etapa: {
          ...etapaAtualizada,
          percentualConcluido: Number(etapaAtualizada.percentualConcluido),
        },
        progressoGeral,
      },
      { status: 200 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ message: "Etapa não encontrada." }, { status: 404 });
    }

    console.error("Erro ao atualizar etapa:", error);
    return NextResponse.json({ message: "Erro interno ao atualizar etapa." }, { status: 500 });
  }
}