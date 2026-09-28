import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AreaDoEngenheiro() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.ENGENHEIRO, Role.SUPER_ADMIN, Role.GESTAO];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/area-do-servidor");
  }

  redirect("/area-do-engenheiro/registro-campo");
}