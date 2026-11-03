import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { message: "Identificador de tipo de obra inválido." },
      { status: 400 }
    );
  }

  try {
    const etapasTemplate = await prisma.etapaTemplate.findMany({
      where: {
        tipoObraId: id,
        ativa: true
      },
      orderBy: { ordem: "asc" },
      include: {
        subEtapasTemplate: {
          where: { ativa: true },
          orderBy: { ordem: "asc" },
          select: {
            id: true,
            nome: true,
            descricao: true,
            peso: true,
            ordem: true
          }
        }
      }
    });

    return NextResponse.json(etapasTemplate, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar etapas do template:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar etapas do template." },
      { status: 500 }
    );
  }
}