import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";

export default async function AreaDoEngenheiro() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.ENGENHEIRO, Role.SUPER_ADMIN, Role.GESTAO];

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  redirect("/area-do-engenheiro/registro-campo");
}