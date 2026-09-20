import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AreaDoServidor() {
  const session = await auth();
  const allowedRoles: Role[] = [
    Role.SUPER_ADMIN,
    Role.GESTAO,
    Role.ADM_SECRETARIA,
    Role.ENGENHEIRO,
  ];

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <main>
      <h1>Área do servidor</h1>
      <p>Usuário autenticado: {session.user.name ?? session.user.email}</p>
    </main>
  );
}