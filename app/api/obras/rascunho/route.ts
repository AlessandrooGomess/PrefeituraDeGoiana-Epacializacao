import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { obraDraftSchema } from "@/lib/validations/obra";

export async function GET() {
  const authorization = await requireUser([Role.ADM_SECRETARIA]);

  if (authorization.response) return authorization.response;
  if (!authorization.user.secretariaId) {
    return NextResponse.json(
      { message: "O usuário não está vinculado a uma secretaria." },
      { status: 403 },
    );
  }

  try {
    const draft = await prisma.rascunhoObra.findFirst({
      where: {
        usuarioId: authorization.user.id,
        secretariaId: authorization.user.secretariaId,
      },
      select: { dados: true, updatedAt: true },
    });

    const parsedDraft = draft ? obraDraftSchema.safeParse(draft.dados) : null;

    return NextResponse.json({
      dados: parsedDraft?.success ? parsedDraft.data : null,
      updatedAt: draft?.updatedAt.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Erro ao carregar rascunho da obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao carregar o rascunho da obra." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const authorization = await requireUser([Role.ADM_SECRETARIA]);

  if (authorization.response) return authorization.response;
  if (!authorization.user.secretariaId) {
    return NextResponse.json(
      { message: "O usuário não está vinculado a uma secretaria." },
      { status: 403 },
    );
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

  const result = obraDraftSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Os dados do rascunho são inválidos.", errors: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const draft = await prisma.rascunhoObra.upsert({
      where: { usuarioId: authorization.user.id },
      create: {
        usuarioId: authorization.user.id,
        secretariaId: authorization.user.secretariaId,
        dados: result.data,
      },
      update: {
        secretariaId: authorization.user.secretariaId,
        dados: result.data,
      },
      select: { id: true, updatedAt: true },
    });

    return NextResponse.json(
      { id: draft.id, updatedAt: draft.updatedAt.toISOString() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao salvar rascunho da obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao salvar o rascunho da obra." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const authorization = await requireUser([Role.ADM_SECRETARIA]);

  if (authorization.response) return authorization.response;

  try {
    await prisma.rascunhoObra.deleteMany({
      where: { usuarioId: authorization.user.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao remover rascunho da obra:", error);
    return NextResponse.json(
      { message: "Erro interno ao remover o rascunho da obra." },
      { status: 500 },
    );
  }
}
