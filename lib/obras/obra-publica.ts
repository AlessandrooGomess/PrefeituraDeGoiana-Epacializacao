import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Dados da obra exibidos na página pública de detalhes (cidadão)
export async function buscarObraPublica(id: string) {
  if (!z.uuid().safeParse(id).success) return null;

  const obra = await prisma.obra.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      titulo: true,
      status: true,
      valorContrato: true,
      empresaContratada: true,
      dataOrdemServico: true,
      previsaoConclusao: true,
      dataConclusaoReal: true,
      secretaria: { select: { nome: true, sigla: true } },
      areaTematica: { select: { nome: true } },
      engenheiro: { select: { nome: true, cargo: true } },
      fotos: {
        orderBy: { dataFoto: "desc" },
        select: { id: true, url: true, descricao: true, dataFoto: true },
      },
      etapasObra: {
        orderBy: { etapaTemplate: { ordem: "asc" } },
        select: {
          id: true,
          status: true,
          percentualConcluido: true,
          dataInicio: true,
          dataPrevisao: true,
          dataConclusao: true,
          etapaTemplate: { select: { nomeCidadao: true, ordem: true } },
        },
      },
    },
  });

  if (!obra) return null;

  // Decimal do Prisma não é serializável para componentes client
  return {
    ...obra,
    valorContrato: obra.valorContrato === null ? null : Number(obra.valorContrato),
    etapasObra: obra.etapasObra.map((etapa) => ({
      ...etapa,
      percentualConcluido: Number(etapa.percentualConcluido),
    })),
  };
}

export type ObraPublica = NonNullable<Awaited<ReturnType<typeof buscarObraPublica>>>;
