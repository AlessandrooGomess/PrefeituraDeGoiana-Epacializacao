import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ObraDetalhe } from "@/types/obra";
import { updateObraSchema } from "@/lib/validations/obra";
import { serializeDate } from "@/lib/serializers/obra";
import { validateObraRelations } from "@/lib/obras/validate-relations";

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

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { message: "O identificador da obra é inválido." },
      { status: 400 },
    );
  }

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "O corpo da requisição deve conter um JSON válido." },
        { status: 400 },
      );
    }

    const result = updateObraSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: "Os dados da obra são inválidos.",
          errors: result.error.issues,
        },
        { status: 400 },
      );
    }

    const data = result.data;
    const currentObra = await prisma.obra.findUnique({
      where: { id },
      select: {
        secretariaId: true,
        eixoId: true,
        areaTematicaId: true,
        engenheiroId: true,
      },
    });

    if (!currentObra) {
      return NextResponse.json(
        { message: "Obra não encontrada." },
        { status: 404 },
      );
    }

    const relationErrors = await validateObraRelations({
      secretariaId: data.secretariaId ?? currentObra.secretariaId,
      eixoId: data.eixoId === undefined ? currentObra.eixoId : data.eixoId,
      areaTematicaId: data.areaTematicaId === undefined
        ? currentObra.areaTematicaId
        : data.areaTematicaId,
      engenheiroId: data.engenheiroId === undefined
        ? currentObra.engenheiroId
        : data.engenheiroId,
    });

    if (relationErrors.length > 0) {
      return NextResponse.json(
        {
          message: "Uma ou mais referências relacionadas são inválidas.",
          fields: relationErrors,
        },
        { status: 400 },
      );
    }

    const updateData: Prisma.ObraUncheckedUpdateInput = {};

    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.endereco !== undefined) updateData.endereco = data.endereco;
    if (data.bairro !== undefined) updateData.bairro = data.bairro;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.valorContrato !== undefined) updateData.valorContrato = data.valorContrato;
    if (data.empresaContratada !== undefined) {
      updateData.empresaContratada = data.empresaContratada;
    }
    if (data.numeroOrdemServico !== undefined) {
      updateData.numeroOrdemServico = data.numeroOrdemServico;
    }
    if (data.dataOrdemServico !== undefined) {
      updateData.dataOrdemServico = data.dataOrdemServico
        ? new Date(data.dataOrdemServico)
        : null;
    }
    if (data.previsaoConclusao !== undefined) {
      updateData.previsaoConclusao = data.previsaoConclusao
        ? new Date(data.previsaoConclusao)
        : null;
    }
    if (data.dataConclusaoReal !== undefined) {
      updateData.dataConclusaoReal = data.dataConclusaoReal
        ? new Date(data.dataConclusaoReal)
        : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.secretariaId !== undefined) updateData.secretariaId = data.secretariaId;
    if (data.eixoId !== undefined) updateData.eixoId = data.eixoId;
    if (data.areaTematicaId !== undefined) updateData.areaTematicaId = data.areaTematicaId;
    if (data.engenheiroId !== undefined) updateData.engenheiroId = data.engenheiroId;

    const obra = await prisma.obra.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        titulo: true,
        status: true,
        secretariaId: true,
        eixoId: true,
        areaTematicaId: true,
        engenheiroId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        ...obra,
        createdAt: serializeDate(obra.createdAt),
        updatedAt: serializeDate(obra.updatedAt),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar obra:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Obra não encontrada para atualização." },
          { status: 404 },
        );
      }
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Conflito com dados únicos já existentes no sistema." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao atualizar obra." },
      { status: 500 },
    );
  }
}