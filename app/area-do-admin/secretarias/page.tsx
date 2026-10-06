import { prisma } from "@/lib/prisma";
import SecretariasClient from "./SecretariasClient";

export const dynamic = "force-dynamic";

export default async function SecretariasAdminPage() {
  const secretarias = await prisma.secretaria.findMany({
    orderBy: { nome: "asc" },
    include: {
      eixo: { select: { nome: true } },
      _count: { select: { obras: true, usuarios: true } },
    }
  });

  return <SecretariasClient secretarias={secretarias} />;
}
