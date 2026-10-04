import { calcularProgressoObra } from "@/lib/obras/calcular-progresso";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessSecretaria, requireUser } from "@/lib/auth/authorization";
import { Prisma, Role } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ message: "O identificador da obra é inválido." }, { status: 400 });
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

    const etapas = await prisma.etapaObra.findMany({
      where: { obraId: id },
      orderBy: { etapaTemplate: { ordem: "asc" } },
      include: {
        etapaTemplate: {
          select: { nome: true, nomeCidadao: true, ordem: true, peso: true, ehContinua: true }
        },
        subEtapasObra: {
          include: {
            subEtapaTemplate: { select: { nome: true, ordem: true, peso: true } }
          },
          orderBy: { subEtapaTemplate: { ordem: "asc" } }
        }
      }
    });

    // Formata a resposta
    const formatado = etapas.map(etapa => ({
      id: etapa.id,
      status: etapa.status,
      percentualConcluido: Number(etapa.percentualConcluido),
      dataInicio: etapa.dataInicio?.toISOString() || null,
      dataPrevisao: etapa.dataPrevisao?.toISOString() || null,
      dataConclusao: etapa.dataConclusao?.toISOString() || null,
      observacoes: etapa.observacoes,
      template: etapa.etapaTemplate,
      subEtapas: etapa.subEtapasObra.map(sub => ({
        id: sub.id,
        status: sub.status,
        percentualConcluido: Number(sub.percentualConcluido),
        template: sub.subEtapaTemplate
      }))
    }));

    const progressoGeral = await calcularProgressoObra(id);
    return NextResponse.json({ etapas: formatado, progressoGeral }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar etapas da obra:", error);
    return NextResponse.json({ message: "Erro interno ao carregar etapas." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ message: "O identificador da obra é inválido." }, { status: 400 });
  }

  // Cadastro de etapas é atribuição da secretaria; o engenheiro não pode cadastrar
  const auth = await requireUser([Role.SUPER_ADMIN, Role.GESTAO, Role.ADM_SECRETARIA]);
  if (auth.response) return auth.response;

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

    const schema = z.object({
      etapasTemplateIds: z.array(z.string().uuid()).optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Dados inválidos.", errors: parsed.error.issues }, { status: 400 });
    }
    const data = parsed.data;

    const obra = await prisma.obra.findUnique({
      where: { id },
      select: { secretariaId: true, deletedAt: true, tipoObraId: true },
    });

    if (!obra || obra.deletedAt) {
      return NextResponse.json({ message: "Obra não encontrada." }, { status: 404 });
    }

    if (!canAccessSecretaria(auth.user, obra.secretariaId)) {
      return NextResponse.json({ message: "Você não tem permissão para alterar esta obra." }, { status: 403 });
    }

    let templateIds = data.etapasTemplateIds;
    if (!templateIds || templateIds.length === 0) {
      if (!obra.tipoObraId) {
        return NextResponse.json(
          { message: "Esta obra não possui tipo de obra definido para carregar etapas." },
          { status: 400 },
        );
      }
      const templates = await prisma.etapaTemplate.findMany({
        where: { tipoObraId: obra.tipoObraId, ativa: true },
        orderBy: { ordem: "asc" },
        select: { id: true },
      });
      templateIds = templates.map((t) => t.id);
    }

    if (templateIds.length === 0) {
      return NextResponse.json(
        { message: "Nenhum modelo de etapa encontrado para associar." },
        { status: 400 },
      );
    }

    if (typeof (prisma.etapaObra as unknown as { createMany?: unknown }).createMany === "function") {
      await prisma.etapaObra.createMany({
        data: templateIds.map((templateId) => ({
          obraId: id,
          etapaTemplateId: templateId,
          status: "PENDENTE",
          percentualConcluido: 0,
        })),
      });
    } else {
      for (const templateId of templateIds) {
        await prisma.etapaObra.create({
          data: {
            obraId: id,
            etapaTemplateId: templateId,
            status: "PENDENTE",
            percentualConcluido: 0,
          },
        });
      }
    }

    const novasEtapas =
      typeof prisma.etapaObra.findMany === "function"
        ? await prisma.etapaObra.findMany({
            where: { obraId: id },
            orderBy: { etapaTemplate: { ordem: "asc" } },
            include: {
              etapaTemplate: {
                select: {
                  nome: true,
                  nomeCidadao: true,
                  ordem: true,
                  peso: true,
                  ehContinua: true,
                },
              },
            },
          })
        : [];

    return NextResponse.json(novasEtapas, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Uma ou mais etapas já foram cadastradas para esta obra." },
        { status: 409 },
      );
    }

    console.error("Erro ao instanciar etapas da obra:", error);
    return NextResponse.json({ message: "Erro interno ao salvar etapas." }, { status: 500 });
  }
}