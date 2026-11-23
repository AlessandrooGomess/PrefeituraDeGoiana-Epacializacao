import { prisma } from "@/lib/prisma";
import SecretariasClient from "./SecretariasClient";

export const dynamic = "force-dynamic";

export default async function SecretariasAdminPage() {
  const [secretarias, eixos] = await Promise.all([
    prisma.secretaria.findMany({
      orderBy: { nome: "asc" },
      include: {
        eixo: { select: { id: true, nome: true } },
        areaTematica: { select: { id: true, nome: true } },
        _count: { select: { obras: true, usuarios: true } },
      },
    }),
    prisma.eixoEstrategico.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        areas: {
          orderBy: { nome: "asc" },
          select: { id: true, nome: true },
        },
      },
    }),
  ]);

  return <SecretariasClient secretarias={secretarias} eixos={eixos} />;
}

