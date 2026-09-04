import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ObraItem } from "@/types/obra";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const obrasDb = await prisma.obra.findMany({
      include: {
        secretaria: {
          select: {
            id: true,
            nome: true,
            sigla: true,
            corIdentificacao: true,
          },
        },
        medicoes: {
          take: 1,
          orderBy: {
            dataVistoria: "desc",
          },
          select: {
            percentualExecutado: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Mapeamento limpo com conversão segura de campos Decimal do Prisma para Number
    const obras: ObraItem[] = obrasDb.map((obra) => ({
      id: obra.id,
      titulo: obra.titulo,
      descricao: obra.descricao,
      endereco: obra.endereco,
      bairro: obra.bairro,
      latitude: obra.latitude,
      longitude: obra.longitude,
      valorContrato: obra.valorContrato ? Number(obra.valorContrato) : null,
      empresaContratada: obra.empresaContratada,
      numeroOrdemServico: obra.numeroOrdemServico,
      previsaoConclusao: obra.previsaoConclusao
        ? obra.previsaoConclusao.toISOString()
        : null,
      status: obra.status,
      secretaria: obra.secretaria,
      percentualExecutado: obra.medicoes[0]
        ? Number(obra.medicoes[0].percentualExecutado)
        : null,
    }));

    return NextResponse.json(obras, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar obras no banco:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar a listagem de obras." },
      { status: 500 }
    );
  }
}

