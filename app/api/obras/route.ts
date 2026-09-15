import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ObraItem } from "@/types/obra";
import { createObraSchema } from "@/lib/validations/obra";

export const dynamic = "force-dynamic";

function serializeDate(date: Date | null): string | null {
  return date?.toISOString() ?? null;
}

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
        fotos: {
          take: 1,
          orderBy: {
            dataFoto: "desc",
          },
          select: {
            url: true,
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
      atualizadoEm: obra.updatedAt.toISOString(),
      imagemUrl: obra.fotos[0]?.url ?? null,
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

export async function POST(request: Request) {
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

    const result = createObraSchema.safeParse(body);

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
    const obra = await prisma.obra.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao ?? null,
        endereco: data.endereco,
        bairro: data.bairro,
        latitude: data.latitude,
        longitude: data.longitude,
        valorContrato: data.valorContrato ?? null,
        empresaContratada: data.empresaContratada ?? null,
        numeroOrdemServico: data.numeroOrdemServico ?? null,
        dataOrdemServico: data.dataOrdemServico
          ? new Date(data.dataOrdemServico)
          : null,
        previsaoConclusao: data.previsaoConclusao
          ? new Date(data.previsaoConclusao)
          : null,
        dataConclusaoReal: data.dataConclusaoReal
          ? new Date(data.dataConclusaoReal)
          : null,
        status: data.status,
        secretariaId: data.secretariaId,
        eixoId: data.eixoId ?? null,
        areaTematicaId: data.areaTematicaId ?? null,
        engenheiroId: data.engenheiroId ?? null,
      },
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
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao criar obra." },
      { status: 500 },
    );
  }
}