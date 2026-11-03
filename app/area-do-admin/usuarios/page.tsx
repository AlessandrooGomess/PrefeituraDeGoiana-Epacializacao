import { prisma } from "@/lib/prisma";
import UsuariosClient from "./UsuariosClient";

export const dynamic = "force-dynamic";

export default async function UsuariosAdminPage() {
  const [usuarios, secretarias] = await Promise.all([
    prisma.usuario.findMany({
      orderBy: { nome: "asc" },
      include: {
        secretaria: { select: { sigla: true, nome: true } },
      }
    }),
    prisma.secretaria.findMany({
      orderBy: { nome: "asc" }
    })
  ]);

  return <UsuariosClient usuarios={usuarios} secretarias={secretarias} />;
}
