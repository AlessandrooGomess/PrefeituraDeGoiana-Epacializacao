import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Dados da obra exibidos na página pública de detalhes (cidadão)
export async function buscarObraPublica(id: string) {
  if (!z.uuid().safeParse(id).success) return null;

  return prisma.obra.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      titulo: true,
      status: true,
      valorContrato: true,
      empresaContratada: true,
      dataOrdemServico: true,
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
          dataPrevisao: true,
          dataConclusao: true,
          etapaTemplate: { select: { nomeCidadao: true } },
        },
      },
    },
  });
}
