import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/authorization";
import { Role } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ message: "O identificador da obra é inválido." }, { status: 400 });
  }

  try {
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

    return NextResponse.json(formatado, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar etapas da obra:", error);
    return NextResponse.json({ message: "Erro interno ao carregar etapas." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const auth = await requireUser([Role.SUPER_ADMIN, Role.GESTAO, Role.ADM_SECRETARIA, Role.ENGENHEIRO]);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const schema = z.object({
      etapasTemplateIds: z.array(z.string().uuid())
    });

    const data = schema.parse(body);

    // Cria as etapas da obra
    const novasEtapas = await Promise.all(
      data.etapasTemplateIds.map(async (templateId) => {
        return prisma.etapaObra.create({
          data: {
            obraId: id,
            etapaTemplateId: templateId,
            status: "PENDENTE",
            percentualConcluido: 0
          }
        });
      })
    );

    return NextResponse.json(novasEtapas, { status: 201 });
  } catch (error) {
    console.error("Erro ao instanciar etapas da obra:", error);
    return NextResponse.json({ message: "Erro interno ao salvar etapas." }, { status: 500 });
  }
}