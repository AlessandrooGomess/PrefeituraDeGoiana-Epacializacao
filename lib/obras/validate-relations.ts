import { prisma } from "@/lib/prisma";

interface ObraRelationIds {
  secretariaId: string;
  eixoId: string | null;
  areaTematicaId: string | null;
  engenheiroId: string | null;
}

export async function validateObraRelations({
  secretariaId,
  eixoId,
  areaTematicaId,
  engenheiroId,
}: ObraRelationIds): Promise<string[]> {
  const [secretaria, eixo, areaTematica, engenheiro] = await Promise.all([
    prisma.secretaria.findUnique({
      where: { id: secretariaId },
      select: { id: true },
    }),
    eixoId
      ? prisma.eixoEstrategico.findUnique({
          where: { id: eixoId },
          select: { id: true },
        })
      : null,
    areaTematicaId
      ? prisma.areaTematica.findUnique({
          where: { id: areaTematicaId },
          select: { id: true, eixoId: true },
        })
      : null,
    engenheiroId
      ? prisma.usuario.findUnique({
          where: { id: engenheiroId },
          select: { id: true, role: true },
        })
      : null,
  ]);

  return [
    !secretaria && "secretariaId",
    eixoId && !eixo && "eixoId",
    areaTematicaId && !areaTematica && "areaTematicaId",
    engenheiroId && !engenheiro && "engenheiroId",
    engenheiroId && engenheiro && engenheiro.role !== "ENGENHEIRO"
      && "engenheiroId",
    eixoId && areaTematica && areaTematica.eixoId !== eixoId
      && "areaTematicaId",
  ].filter((field): field is string => Boolean(field));
}