import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AreaDoEngenheiro() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== Role.ENGENHEIRO) {
    redirect("/area-do-servidor");
  }

  return null;
}

const session = await auth();

if (session?.user?.role === Role.ENGENHEIRO) {
    redirect("/area-do-engenheiro");
}