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
      areaTematica: { select: { nome: true } },
    },
  });
}
