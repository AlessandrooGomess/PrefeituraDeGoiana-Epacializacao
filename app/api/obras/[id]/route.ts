import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { ObraDetalhe } from "@/types/obra";
import { serializeDate } from "@/lib/serializers/obra";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { message: "O identificador da obra é inválido." },
      { status: 400 },
    );
  }

  try {
    const obra = await prisma.obra.findUnique({
      where: { id },
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
        engenheiro: {
          select: {
            id: true,
            nome: true,
            cargo: true,
          },
        },
        medicoes: {
          orderBy: { dataVistoria: "desc" },
          select: {
            id: true,
            dataVistoria: true,
            percentualExecutado: true,
            observacoesTecnicas: true,
            engenheiro: {
              select: {
                id: true,
                nome: true,
                cargo: true,
              },
            },
          },
        },
        fotos: {
          orderBy: { dataFoto: "desc" },
          select: {
            id: true,
            url: true,
            tipo: true,
            descricao: true,
            dataFoto: true,
          },
        },
      },
    });

    if (!obra) {
      return NextResponse.json(
        { message: "Obra não encontrada." },
        { status: 404 },
      );
    }

    const detalhe: ObraDetalhe = {
      id: obra.id,
      titulo: obra.titulo,
      descricao: obra.descricao,
      endereco: obra.endereco,
      bairro: obra.bairro,
      latitude: obra.latitude,
      longitude: obra.longitude,
      valorContrato: obra.valorContrato === null ? null : Number(obra.valorContrato),
      empresaContratada: obra.empresaContratada,
      numeroOrdemServico: obra.numeroOrdemServico,
      dataOrdemServico: serializeDate(obra.dataOrdemServico),
      previsaoConclusao: serializeDate(obra.previsaoConclusao),
      dataConclusaoReal: serializeDate(obra.dataConclusaoReal),
      atualizadoEm: obra.updatedAt.toISOString(),
      createdAt: obra.createdAt.toISOString(),
      imagemUrl: obra.fotos[0]?.url ?? null,
      status: obra.status,
      secretaria: obra.secretaria,
      eixo: obra.eixo,
      areaTematica: obra.areaTematica,
      percentualExecutado: obra.medicoes[0]
        ? Number(obra.medicoes[0].percentualExecutado)
        : null,
      engenheiro: obra.engenheiro,
      medicoes: obra.medicoes.map((medicao) => ({
        id: medicao.id,
        dataVistoria: medicao.dataVistoria.toISOString(),
        percentualExecutado: Number(medicao.percentualExecutado),
        observacoesTecnicas: medicao.observacoesTecnicas,
        engenheiro: medicao.engenheiro,
      })),
      fotos: obra.fotos.map((foto) => ({
        id: foto.id,
        url: foto.url,
        tipo: foto.tipo,
        descricao: foto.descricao,
        dataFoto: foto.dataFoto.toISOString(),
      })),
    };

    return NextResponse.json(detalhe, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar a obra." },
      { status: 500 },
    );
  }
}