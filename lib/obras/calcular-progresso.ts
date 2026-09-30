import { prisma } from "@/lib/prisma";

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

  if (etapas.length === 0) return 0;

  let somaPonderada = 0;
  let somaPesos = 0;

  for (const etapa of etapas) {
    const peso = etapa.etapaTemplate.peso;
    const percentual = Number(etapa.percentualConcluido);
    somaPonderada += percentual * peso;
    somaPesos += peso;
  }

  if (somaPesos === 0) return 0;

  return Math.round((somaPonderada / somaPesos) * 100) / 100;
}