import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistroCampoForm } from "@/components/registro-campo/RegistroCampoForm";
import { EngenheiroShell } from "@/components/area-engenheiro/EngenheiroShell";

export default async function RegistroCampoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.ENGENHEIRO, Role.SUPER_ADMIN, Role.GESTAO];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/area-do-servidor");
  }

  // Busca obras reais vinculadas ao engenheiro logado ou à secretaria dele
  const obras = await prisma.obra.findMany({
    where: {
      deletedAt: null,
      ...(session.user.role === Role.ENGENHEIRO
        ? { engenheiroId: session.user.id }
        : session.user.secretariaId
        ? { secretariaId: session.user.secretariaId }
        : {}),
    },
    select: {
      id: true,
      titulo: true,
      numeroOrdemServico: true,
      bairro: true,
      empresaContratada: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <EngenheiroShell titulo="Novo Registro" fecharHref="/area-do-engenheiro" abaAtiva="diario">
      {/* Título e Subtítulo */}
      <div className="space-y-0.5 md:space-y-1">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
          Registro de Campo
        </h2>
        <p className="text-xs md:text-sm text-slate-500">
          Preencha os dados da vistoria diária.
        </p>
      </div>

      {/* Orquestrador de Cards e Estados */}
      <RegistroCampoForm obras={obras} />
    </EngenheiroShell>
  );
}