import { prisma } from "@/lib/prisma";

interface ObraRelationIds {
  secretariaId: string;
  eixoId: string | null;
  areaTematicaId: string | null;
  engenheiroId: string | null;
  tipoObraId?: string | null;
}

export async function validateObraRelations({
  secretariaId,
  eixoId,
  areaTematicaId,
  engenheiroId,
  tipoObraId,
}: ObraRelationIds): Promise<string[]> {
  const [secretaria, eixo, areaTematica, engenheiro, tipoObra] = await Promise.all([
    prisma.secretaria.findUnique({
      where: { id: secretariaId },
      select: {
        id: true,
        eixoId: true,
      },
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
          select: {
            id: true,
            role: true,
            ativo: true,
            secretariaId: true,
          },
        })
      : null,
    tipoObraId
      ? prisma.tipoObra.findUnique({
          where: { id: tipoObraId },
          select: { id: true },
        })
      : null,
  ]);

  return [
    !secretaria && "secretariaId",
    eixoId && !eixo && "eixoId",
    eixoId && eixo && secretaria && secretaria.eixoId !== eixoId && "eixoId",
    areaTematicaId && !areaTematica && "areaTematicaId",
    engenheiroId && !engenheiro && "engenheiroId",
    engenheiroId &&
      engenheiro &&
      (engenheiro.role !== "ENGENHEIRO" ||
        !engenheiro.ativo ||
        engenheiro.secretariaId !== secretariaId) &&
      "engenheiroId",
    tipoObraId && !tipoObra && "tipoObraId",
    eixoId &&
      areaTematica &&
      areaTematica.eixoId !== eixoId &&
      "areaTematicaId",
  ].filter((field): field is string => Boolean(field));
}
