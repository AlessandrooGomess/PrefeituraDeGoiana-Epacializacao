import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";
import { prisma } from "@/lib/prisma";
import { filtroObrasAreaEngenheiro } from "@/lib/obras/filtro-area-engenheiro";
import { EngenheiroShell } from "@/components/area-engenheiro/EngenheiroShell";
import {
  ObraResponsavelCard,
  type ObraResponsavel,
} from "@/components/area-engenheiro/ObraResponsavelCard";
import { calcularProgressoObra } from "@/lib/obras/calcular-progresso";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AreaDoEngenheiro() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.ENGENHEIRO, Role.SUPER_ADMIN, Role.GESTAO];

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  const obrasDb = await prisma.obra.findMany({
    where: filtroObrasAreaEngenheiro(session.user),
    select: {
      id: true,
      titulo: true,
      bairro: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const obras: ObraResponsavel[] = await Promise.all(
    obrasDb.map(async (obra) => ({
      id: obra.id,
      titulo: obra.titulo,
      bairro: obra.bairro,
      status: obra.status,
      percentualExecutado: await calcularProgressoObra(obra.id),
    }))
  );

  const primeiroNome = session.user.name?.trim().split(/\s+/)[0];
  const isEngenheiro = session.user.role === Role.ENGENHEIRO;
  const descricaoLista = isEngenheiro
    ? `Você é responsável por ${obras.length} ${obras.length === 1 ? "obra" : "obras"}:`
    : `${obras.length} ${obras.length === 1 ? "obra disponível" : "obras disponíveis"} para registro:`;

  return (
    <EngenheiroShell titulo="Área do Engenheiro">
      <div className="space-y-0.5 md:space-y-1">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
          Olá{primeiroNome ? `, ${primeiroNome}` : ""}! Veio fazer o registro do dia?
        </h2>
        <p className="text-xs md:text-sm text-slate-500">
          {obras.length > 0 ? descricaoLista : "Escolha uma obra para iniciar a vistoria."}
        </p>
      </div>

      {obras.length > 0 ? (
        <ul className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {obras.map((obra) => (
            <li key={obra.id} className="grid">
              <ObraResponsavelCard obra={obra} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          Nenhuma obra sob sua responsabilidade no momento.
        </div>
      )}
    </EngenheiroShell>
  );
}
