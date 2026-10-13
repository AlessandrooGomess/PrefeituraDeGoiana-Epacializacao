import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";
import PrefeitoDashboard from "@/app/area-do-servidor/PrefeitoDashboard";

export const dynamic = "force-dynamic";

export default async function AreaDoPrefeitoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.GESTAO, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  return <PrefeitoDashboard name={session.user.name ?? "Prefeito"} />;
}
