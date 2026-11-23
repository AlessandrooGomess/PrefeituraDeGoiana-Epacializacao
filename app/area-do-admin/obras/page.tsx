import { prisma } from "@/lib/prisma";
import ObrasAdminClient from "./ObrasAdminClient";

export const dynamic = "force-dynamic";

export default async function ObrasAdminPage() {
  const [obras, secretarias] = await Promise.all([
    prisma.obra.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        titulo: true,
        bairro: true,
        status: true,
        secretaria: { select: { id: true, nome: true, sigla: true } },
      },
    }),
    prisma.secretaria.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sigla: true },
    }),
  ]);

  return <ObrasAdminClient obras={obras} secretarias={secretarias} />;
}

