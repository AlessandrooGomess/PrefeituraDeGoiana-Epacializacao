import { Role } from "@prisma/client";
import { ArrowLeft, CheckCircle2, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { getHomeByRole } from "@/lib/auth/role-routes";
import { prisma } from "@/lib/prisma";
import styles from "../../../area-do-servidor.module.css";

export default async function ConfirmacaoNovaObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  if (!session?.user) redirect("/login");
  if (session.user.role !== Role.ADM_SECRETARIA) {
    redirect(getHomeByRole(session.user.role));
  }
  if (!session.user.secretariaId) redirect("/");

  const obra = await prisma.obra.findFirst({
    where: {
      id,
      secretariaId: session.user.secretariaId,
      deletedAt: null,
    },
    select: {
      titulo: true,
      numeroOrdemServico: true,
      valorContrato: true,
      empresaContratada: true,
      createdAt: true,
      tipoObraId: true,
      secretaria: { select: { nome: true, sigla: true } },
      engenheiro: { select: { nome: true } },
    },
  });

  if (!obra) redirect("/area-do-servidor");

  const tipoObra = obra.tipoObraId
    ? await prisma.tipoObra.findUnique({
        where: { id: obra.tipoObraId },
        select: { nome: true },
      })
    : null;

  const resumo = [
    ["Nome oficial da obra", obra.titulo],
    ["Código identificador", obra.numeroOrdemServico || "Não informado"],
    ["Categoria da intervenção", tipoObra?.nome || "Não informada"],
    ["Secretaria", `${obra.secretaria.sigla} · ${obra.secretaria.nome}`],
    [
      "Valor contratado",
      obra.valorContrato === null
        ? "Não informado"
        : new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(obra.valorContrato)),
    ],
    ["Empresa contratada", obra.empresaContratada || "Não informada"],
    ["Engenheiro fiscal", obra.engenheiro?.nome || "Não atribuído"],
    [
      "Data do cadastro",
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
        obra.createdAt,
      ),
    ],
  ];

  return (
    <div className={styles.shell}>
      <Sidebar
        user={{
          name: session.user.name ?? session.user.email ?? "Usuário",
          role: session.user.role,
        }}
      />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.profileIcon}>{obra.secretaria.sigla}</div>
            <div>
              <strong>{obra.secretaria.sigla}</strong>
              <small>{obra.secretaria.nome}</small>
            </div>
          </div>
          <nav className={styles.navList} aria-label="Navegação da secretaria">
            <Link className={styles.navItem} href="/area-do-servidor">
              Visão geral
            </Link>
            <Link className={styles.navItem} href="/area-do-servidor/nova-obra">
              Cadastrar obra
            </Link>
          </nav>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>
                Obras e Projetos <span>/</span> Confirmação do cadastro
              </div>
              <h1 className={styles.pageTitle}>Confirmação da publicação</h1>
              <p>O registro da obra foi salvo no sistema municipal.</p>
            </div>
          </div>

          <section className="mb-6 flex flex-col items-center gap-2 border-y border-emerald-200 bg-emerald-50 px-5 py-7 text-center">
            <CheckCircle2
              className="h-10 w-10 text-emerald-600"
              aria-hidden="true"
            />
            <h2 className="m-0 text-lg font-bold text-slate-900">
              Obra cadastrada com sucesso!
            </h2>
            <p className="m-0 max-w-xl text-sm text-slate-600">
              {obra.titulo} está disponível para acompanhamento.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
            <section className={styles.card} aria-labelledby="resumo-obra">
              <div className={styles.cardHeading}>
                <div>
                  <span className={styles.step} aria-hidden="true">
                    <ClipboardList size={16} />
                  </span>
                  <div>
                    <h2 id="resumo-obra">Resumo do registro</h2>
                    <p>Dados salvos para esta obra</p>
                  </div>
                </div>
                <span className={styles.statusTag}>Cadastrada</span>
              </div>

              <dl className="m-0 divide-y divide-slate-100">
                {resumo.map(([label, value]) => (
                  <div
                    className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-4"
                    key={label}
                  >
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="m-0 wrap-break-word text-sm font-medium text-slate-800 sm:text-right">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.card} aria-labelledby="proximos-passos">
              <div className={styles.cardHeading}>
                <div>
                  <div>
                    <h2 id="proximos-passos">Próximos passos</h2>
                    <p>Continue pela área administrativa</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Link className={styles.primaryButton} href="/area-do-servidor">
                  <ClipboardList size={16} aria-hidden="true" />
                  Voltar à visão geral
                </Link>
                <Link
                  className={styles.secondaryButton}
                  href="/area-do-servidor/nova-obra"
                >
                  <Plus size={16} aria-hidden="true" />
                  Cadastrar outra obra
                </Link>
                <Link
                  className="inline-flex min-h-9 items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
                  href="/area-do-servidor"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Voltar à lista de projetos
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}