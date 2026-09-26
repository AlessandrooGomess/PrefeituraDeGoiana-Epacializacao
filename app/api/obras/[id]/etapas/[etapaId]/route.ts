import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { Role } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string; etapaId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, etapaId } = await context.params;

  // Apenas cargos autorizados podem atualizar o progresso
  const auth = await requireUser([Role.SUPER_ADMIN, Role.GESTAO, Role.ADM_SECRETARIA, Role.ENGENHEIRO]);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const updateSchema = z.object({
      status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "PARALISADA"]).optional(),
      percentualConcluido: z.number().min(0).max(100).optional(),
      dataInicio: z.string().datetime().optional().nullable(),
      dataPrevisao: z.string().datetime().optional().nullable(),
      dataConclusao: z.string().datetime().optional().nullable(),
      observacoes: z.string().optional().nullable(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ message: "Dados inválidos.", errors: result.error.issues }, { status: 400 });
    }

    const data = result.data;

    // Atualiza a etapa especifica
    const etapaAtualizada = await prisma.etapaObra.update({
      where: { id: etapaId, obraId: id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.percentualConcluido !== undefined && { percentualConcluido: data.percentualConcluido }),
        ...(data.dataInicio !== undefined && { dataInicio: data.dataInicio ? new Date(data.dataInicio) : null }),
        ...(data.dataPrevisao !== undefined && { dataPrevisao: data.dataPrevisao ? new Date(data.dataPrevisao) : null }),
        ...(data.dataConclusao !== undefined && { dataConclusao: data.dataConclusao ? new Date(data.dataConclusao) : null }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      }
    });

    return NextResponse.json(
      {
        ...etapaAtualizada,
        percentualConcluido: Number(etapaAtualizada.percentualConcluido)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar etapa:", error);
    return NextResponse.json({ message: "Erro interno ao atualizar etapa." }, { status: 500 });
  }
}