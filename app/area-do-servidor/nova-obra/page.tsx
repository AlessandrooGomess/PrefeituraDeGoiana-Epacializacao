import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ObraForm from "../ObraForm";

export default async function NovaObraPage() {
  const session = await auth();
  const allowedRoles: Role[] = [Role.ADM_SECRETARIA, Role.ENGENHEIRO];

  if (!session?.user) redirect("/login");
  if (!allowedRoles.includes(session.user.role) || session.user.role !== Role.ADM_SECRETARIA) redirect("/");
  if (!session.user.secretariaId) redirect("/");

  const [secretaria, engenheiros] = await Promise.all([
    prisma.secretaria.findUniqueOrThrow({
      where: { id: session.user.secretariaId },
      select: { id: true, nome: true, sigla: true, eixo: { select: { id: true, nome: true } } },
    }),
    prisma.usuario.findMany({
      where: { secretariaId: session.user.secretariaId, role: Role.ENGENHEIRO, ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return <ObraForm user={{ name: session.user.name ?? session.user.email ?? "Usuário", role: session.user.role }} secretaria={secretaria} engenheiros={engenheiros} />;
}