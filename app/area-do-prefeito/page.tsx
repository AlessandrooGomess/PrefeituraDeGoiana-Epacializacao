import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";
import PrefeitoDashboard from "@/app/area-do-servidor/PrefeitoDashboard";

export const dynamic = "force-dynamic";

export default async function AreaDoPrefeitoPage(props: {
  searchParams?: Promise<{ secretaria?: string; eixo?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.GESTAO, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  const searchParams = await props.searchParams;

  return (
    <PrefeitoDashboard
      name={session.user.name ?? "Prefeito"}
      role={session.user.role}
      filtroSecretaria={searchParams?.secretaria}
      filtroEixo={searchParams?.eixo}
    />
  );
}
