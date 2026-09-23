import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const eixos = await prisma.eixoEstrategico.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        slug: true,
        cor: true,
        secretarias: {
          orderBy: { nome: "asc" },
          select: {
            id: true,
            nome: true,
            sigla: true,
            corIdentificacao: true,
          },
        },
      },
    });

    return NextResponse.json(eixos);
  } catch (error) {
    console.error("Erro ao carregar filtros:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar filtros." },
      { status: 500 },
    );
  }
}