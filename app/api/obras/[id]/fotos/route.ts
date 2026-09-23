import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaria, requireUser } from "@/lib/auth/authorization";
import { serializeDate } from "@/lib/serializers/obra";
import { createFotoSchema } from "@/lib/validations/foto";

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

    const fotos = await prisma.foto.findMany({
      where: { obraId: id },
      orderBy: { dataFoto: "desc" },
      select: {
        id: true,
        obraId: true,
        usuarioId: true,
        url: true,
        tipo: true,
        descricao: true,
        dataFoto: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      fotos.map((foto) => ({
        ...foto,
        dataFoto: serializeDate(foto.dataFoto),
        createdAt: serializeDate(foto.createdAt),
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar as fotos da obra." },
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

  const authorization = await requireUser([
    Role.SUPER_ADMIN,
    Role.GESTAO,
    Role.ADM_SECRETARIA,
    Role.ENGENHEIRO,
  ]);

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

  const result = createFotoSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Os dados da foto são inválidos.",
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
        { message: "Você não tem permissão para adicionar foto nesta obra." },
        { status: 403 },
      );
    }

    const foto = await prisma.foto.create({
      data: {
        obraId: id,
        usuarioId: authorization.user.id,
        url: result.data.url,
        tipo: result.data.tipo,
        descricao: result.data.descricao ?? null,
        dataFoto: result.data.dataFoto
          ? new Date(result.data.dataFoto)
          : undefined,
      },
      select: {
        id: true,
        obraId: true,
        usuarioId: true,
        url: true,
        tipo: true,
        descricao: true,
        dataFoto: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...foto,
        dataFoto: serializeDate(foto.dataFoto),
        createdAt: serializeDate(foto.createdAt),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar foto:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "A obra ou o usuário informado não existe." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao criar foto." },
      { status: 500 },
    );
  }
}