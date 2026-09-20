import { Prisma, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaria, requireUser } from "@/lib/auth/authorization";
import { serializeDate } from "@/lib/serializers/obra";
import { createMedicaoSchema } from "@/lib/validations/medicao";

interface RouteContext {
  params: Promise<{ id: string }>;
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

  const result = createMedicaoSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Os dados da medição são inválidos.",
        errors: result.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const obra = await prisma.obra.findUnique({
      where: { id },
      select: { id: true, secretariaId: true },
    });

    if (!obra) {
      return NextResponse.json(
        { message: "Obra não encontrada." },
        { status: 404 },
      );
    }

    if (!canAccessSecretaria(authorization.user, obra.secretariaId)) {
      return NextResponse.json(
        { message: "Você não tem permissão para registrar medição nesta obra." },
        { status: 403 },
      );
    }

    if (result.data.engenheiroId !== authorization.user.id) {
      return NextResponse.json(
        { message: "A medição deve ser registrada pelo engenheiro autenticado." },
        { status: 403 },
      );
    }

    const engenheiro = await prisma.usuario.findUnique({
      where: { id: result.data.engenheiroId },
      select: { id: true, role: true, ativo: true },
    });

    if (
      !engenheiro ||
      engenheiro.role !== "ENGENHEIRO" ||
      !engenheiro.ativo
    ) {
      return NextResponse.json(
        {
          message: "O engenheiro informado é inválido ou está inativo.",
          fields: ["engenheiroId"],
        },
        { status: 400 },
      );
    }

    const medicao = await prisma.medicao.create({
      data: {
        obraId: id,
        engenheiroId: result.data.engenheiroId,
        dataVistoria: result.data.dataVistoria
          ? new Date(result.data.dataVistoria)
          : undefined,
        percentualExecutado: result.data.percentualExecutado,
        observacoesTecnicas: result.data.observacoesTecnicas ?? null,
      },
      select: {
        id: true,
        obraId: true,
        engenheiroId: true,
        dataVistoria: true,
        percentualExecutado: true,
        observacoesTecnicas: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...medicao,
        dataVistoria: serializeDate(medicao.dataVistoria),
        percentualExecutado: Number(medicao.percentualExecutado),
        createdAt: serializeDate(medicao.createdAt),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar medição:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { message: "A obra ou o engenheiro informado não existe." },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { message: "Erro interno ao criar medição." },
      { status: 500 },
    );
  }
}
