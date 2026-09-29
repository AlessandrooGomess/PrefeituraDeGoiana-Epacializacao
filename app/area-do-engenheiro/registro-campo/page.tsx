import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistroCampoHeader } from "@/components/registro-campo/RegistroCampoHeader";
import { RegistroCampoForm } from "@/components/registro-campo/RegistroCampoForm";
import { BottomNav } from "@/components/registro-campo/BottomNav";

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
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased">
      {/* Moldura mobile-first: coluna de celular no mobile, largura total a partir do tablet */}
      <div className="w-full max-w-md md:max-w-none min-h-screen bg-slate-50 flex flex-col shadow-xl md:shadow-none pb-24 relative border-x border-slate-200 md:border-x-0">
        {/* Topo Azul com botão fechar */}
        <RegistroCampoHeader backHref="/area-do-engenheiro" />

        {/* Conteúdo Principal com Formulário Dinâmico */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-4 pb-6 md:px-8 md:pt-8 space-y-3.5 md:space-y-5">
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
        </main>

        {/* Barra de Navegação Inferior Fixa */}
        <BottomNav activeTab="diario" />
      </div>
    </div>
  );
}