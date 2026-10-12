import { prisma } from "@/lib/prisma";
import { calcularMediaPonderada } from "@/lib/obras/progresso";

export async function calcularProgressoObra(obraId: string): Promise<number> {
  const etapas = await prisma.etapaObra.findMany({
    where: { obraId },
    select: {
      percentualConcluido: true,
      etapaTemplate: {
        select: { peso: true },
      },
    },
  });

  return calcularMediaPonderada(
    etapas.map((etapa) => ({
      percentual: Number(etapa.percentualConcluido),
      peso: etapa.etapaTemplate.peso,
    })),
  );
}