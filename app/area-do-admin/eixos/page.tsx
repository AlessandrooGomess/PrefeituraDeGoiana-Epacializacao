import { prisma } from "@/lib/prisma";
import EixosClient from "./EixosClient";

export const dynamic = "force-dynamic";

export default async function EixosAdminPage() {
  const eixos = await prisma.eixoEstrategico.findMany({
    orderBy: { nome: "asc" },
    include: {
      areas: { orderBy: { nome: "asc" }, select: { nome: true } },
      _count: { select: { obras: true, secretarias: true } },
    }
  });

  return <EixosClient eixos={eixos} />;
}
