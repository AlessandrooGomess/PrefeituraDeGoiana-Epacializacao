import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";

export default async function PosLoginPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getHomeByRole(session.user.role));
}