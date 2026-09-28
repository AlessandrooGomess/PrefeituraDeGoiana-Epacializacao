import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaria, requireUser } from "@/lib/auth/authorization";
import { serializeDate } from "@/lib/serializers/obra";
import { createRegistroCampoSchema } from "@/lib/validations/registro-campo";

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
      select: { id: true, deletedAt: true },
    });

    if (!obra || obra.deletedAt) {
      return NextResponse.json(
        { message: "Obra não encontrada." },
        { status: 404 },
      );
    }

    const registros = await prisma.registroCampo.findMany({
      where: { obraId: id },
      orderBy: { dataVistoria: "desc" },
      select: {
        id: true,
        obraId: true,
        engenheiroId: true,
        dataVistoria: true,
        status: true,
        intercorrencias: true,
        observacoes: true,
        createdAt: true,
        updatedAt: true,
        engenheiro: {
          select: {
            id: true,
            nome: true,
            cargo: true,
          },
        },
        fotos: {
          select: {
            id: true,
            url: true,
            descricao: true,
            latitude: true,
            longitude: true,
            dataFoto: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      registros.map((reg) => ({
        ...reg,
        dataVistoria: serializeDate(reg.dataVistoria),
        createdAt: serializeDate(reg.createdAt),
        updatedAt: serializeDate(reg.updatedAt),
        fotos: reg.fotos.map((f) => ({
          ...f,
          dataFoto: serializeDate(f.dataFoto),
          createdAt: serializeDate(f.createdAt),
        })),
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar registros de campo:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar os registros de campo da obra." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json(
      { message: "O identificador da obra é inválido." },
      { status: 400 },
    );
  }

  const authorization = await requireUser([Role.ENGENHEIRO]);

  if (authorization.response) {
    return authorization.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "O corpo da requisição deve conter um JSON válido." },
      { status: 400 },
    );
  }

  const result = createRegistroCampoSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Os dados do registro de campo são inválidos.",
        errors: result.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const obra = await prisma.obra.findUnique({
      where: { id },
      select: { id: true, secretariaId: true, deletedAt: true },
    });

    if (!obra || obra.deletedAt) {
      return NextResponse.json(
        { message: "Obra não encontrada." },
        { status: 404 },
      );
    }

    if (!canAccessSecretaria(authorization.user, obra.secretariaId)) {
      return NextResponse.json(
        {
          message:
            "Você não tem permissão para registrar vistoria nesta obra.",
        },
        { status: 403 },
      );
    }

    const registro = await prisma.registroCampo.create({
      data: {
        obraId: id,
        engenheiroId: authorization.user.id,
        dataVistoria: result.data.dataVistoria
          ? new Date(result.data.dataVistoria)
          : undefined,
        status: result.data.status,
        intercorrencias: result.data.intercorrencias,
        observacoes: result.data.observacoes ?? null,
        fotos: {
          create: result.data.fotos.map((foto) => ({
            obraId: id,
            usuarioId: authorization.user.id,
            url: foto.url,
            descricao: foto.descricao ?? null,
            latitude: foto.latitude ?? null,
            longitude: foto.longitude ?? null,
          })),
        },
      },
      select: {
        id: true,
        obraId: true,
        engenheiroId: true,
        dataVistoria: true,
        status: true,
        intercorrencias: true,
        observacoes: true,
        createdAt: true,
        updatedAt: true,
        engenheiro: {
          select: {
            id: true,
            nome: true,
            cargo: true,
          },
        },
        fotos: {
          select: {
            id: true,
            url: true,
            descricao: true,
            latitude: true,
            longitude: true,
            dataFoto: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...registro,
        dataVistoria: serializeDate(registro.dataVistoria),
        createdAt: serializeDate(registro.createdAt),
        updatedAt: serializeDate(registro.updatedAt),
        fotos: registro.fotos.map((f) => ({
          ...f,
          dataFoto: serializeDate(f.dataFoto),
          createdAt: serializeDate(f.createdAt),
        })),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar registro de campo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "A obra ou o usuário informado não existe." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao criar o registro de campo." },
      { status: 500 },
    );
  }
}