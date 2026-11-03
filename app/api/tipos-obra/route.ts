import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tiposObra = await prisma.tipoObra.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        slug: true,
        descricao: true,
        _count: {
          select: { etapasTemplate: { where: { ativa: true } } }
        }
      }
    });

    const formatado = tiposObra.map(tipo => ({
      id: tipo.id,
      nome: tipo.nome,
      slug: tipo.slug,
      descricao: tipo.descricao,
      totalEtapas: tipo._count.etapasTemplate
    }));

    return NextResponse.json(formatado, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar tipos de obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar tipos de obra." },
      { status: 500 }
    );
  }
}