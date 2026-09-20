import { Prisma } from "@prisma/client";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaria, requireUser } from "@/lib/auth/authorization";
import { ObraItem } from "@/types/obra";
import { createObraSchema, listObrasQuerySchema } from "@/lib/validations/obra";
import { serializeDate } from "@/lib/serializers/obra";
import { validateObraRelations } from "@/lib/obras/validate-relations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const queryResult = listObrasQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    secretariaId: url.searchParams.get("secretariaId") ?? undefined,
    eixoId: url.searchParams.get("eixoId") ?? undefined,
    areaTematicaId: url.searchParams.get("areaTematicaId") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  });

  if (!queryResult.success) {
    return NextResponse.json(
      {
        message: "Os parâmetros da consulta são inválidos.",
        errors: queryResult.error.issues,
      },
      { status: 400 },
    );
  }

  const query = queryResult.data;
  const paginada = query.page !== undefined || query.pageSize !== undefined;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  try {
    const where: Prisma.ObraWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.secretariaId ? { secretariaId: query.secretariaId } : {}),
      ...(query.eixoId ? { eixoId: query.eixoId } : {}),
      ...(query.areaTematicaId ? { areaTematicaId: query.areaTematicaId } : {}),
      ...(query.search
        ? {
            OR: [
              {
                titulo: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                endereco: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                bairro: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                empresaContratada: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const obrasDb = await prisma.obra.findMany({
      where,
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
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      ...(paginada
        ? {
            skip: (page - 1) * pageSize,
            take: pageSize,
          }
        : {}),
    });

    const obras: ObraItem[] = obrasDb.map((obra) => ({
      id: obra.id,
      titulo: obra.titulo,
      descricao: obra.descricao,
      endereco: obra.endereco,
      bairro: obra.bairro,
      latitude: obra.latitude,
      longitude: obra.longitude,
      valorContrato:
        obra.valorContrato === null ? null : Number(obra.valorContrato),
      empresaContratada: obra.empresaContratada,
      numeroOrdemServico: obra.numeroOrdemServico,

      dataOrdemServico: serializeDate(obra.dataOrdemServico),
      previsaoConclusao: serializeDate(obra.previsaoConclusao),
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

    if (!paginada) {
      return NextResponse.json(obras, { status: 200 });
    }

    const total = await prisma.obra.count({ where });

    return NextResponse.json(
      {
        items: obras,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar obras:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar listagem de obras." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authorization = await requireUser([
    Role.SUPER_ADMIN,
    Role.GESTAO,
    Role.ADM_SECRETARIA,
  ]);

  if (authorization.response) {
    return authorization.response;
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

    if (!canAccessSecretaria(authorization.user, data.secretariaId)) {
      return NextResponse.json(
        { message: "Você não tem permissão para esta secretaria." },
        { status: 403 },
      );
    }

    const missingRelations = await validateObraRelations({
      secretariaId: data.secretariaId,
      eixoId: data.eixoId ?? null,
      areaTematicaId: data.areaTematicaId ?? null,
      engenheiroId: data.engenheiroId ?? null,
    });

    if (missingRelations.length > 0) {
      return NextResponse.json(
        {
          message: "Uma ou mais referências relacionadas são inválidas.",
          fields: missingRelations,
        },
        { status: 400 },
      );
    }

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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Já existe uma obra cadastrada com esses dados únicos." },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { message: "Erro interno ao criar obra." },
      { status: 500 },
    );
  }
}
