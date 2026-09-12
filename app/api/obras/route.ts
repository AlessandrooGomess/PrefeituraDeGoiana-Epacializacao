import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ObraItem } from "@/types/obra";

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
        eixo: {
          select: {
            id: true,
            nome: true,
            slug: true,
            cor: true,
          },
        },
        areaTematica: {
          select: {
            id: true,
            nome: true,
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

      dataOrdemServico: obra.dataOrdemServico
      ? obra.dataOrdemServico.toISOString()
      : null,
      previsaoConclusao: obra.previsaoConclusao
      ? obra.previsaoConclusao.toISOString()
      : null,
      dataConclusaoReal: obra.dataConclusaoReal
      ? obra.dataConclusaoReal.toISOString()
      : null,

      status: obra.status,
      secretaria: obra.secretaria,
      eixo: obra.eixo,
      areaTematica: obra.areaTematica,

      percentualExecutado: obra.medicoes[0]
      ? Number(obra.medicoes[0].percentualExecutado)
      : null,
    }));

    return NextResponse.json(obras, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar obras:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar listagem de obras." },
      { status: 500 }
    );
  }
}