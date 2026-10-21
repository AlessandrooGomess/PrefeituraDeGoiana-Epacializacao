import { Role } from "@prisma/client";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { prisma } from "@/lib/prisma";
import styles from "./area-do-servidor.module.css";
import DeleteObraButton from "./DeleteObraButton";
import { getHomeByRole } from "@/lib/auth/role-routes";

export default async function AreaDoServidor() {
  const session = await auth();

  const allowedRoles: Role[] = [
    Role.GESTAO,
    Role.ADM_SECRETARIA,
  ];

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  if (session.user.role === Role.GESTAO) {
    redirect("/area-do-prefeito");
  }

  const isSecretaria = session.user.role === Role.ADM_SECRETARIA;
  const secretariaId = session.user.secretariaId;

  if (isSecretaria && !secretariaId) {
    redirect("/");
  }

  const where = {
    deletedAt: null,
    ...(isSecretaria && secretariaId ? { secretariaId } : {}),
  };

  const statusLabel = {
    PLANEJADA: "Em planejamento",
    ORDEM_EMITIDA: "Ordem emitida",
    EM_ANDAMENTO: "Em andamento",
    PARALISADA: "Paralisada",
    CONCLUIDA: "Concluída",
  } as const;

  let obras: Array<{
    id: string;
    titulo: string;
    status: keyof typeof statusLabel;
    updatedAt: Date;
    secretaria: { nome: string };
  }> = [];
  let totalObras = 0;
  let emAndamento = 0;
  let concluidas = 0;

  try {
    const [obrasResult, statusCounts] = await Promise.all([
      prisma.obra.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          titulo: true,
          status: true,
          updatedAt: true,
          secretaria: { select: { nome: true } },
        },
      }),
      prisma.obra.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
    ]);

    obras = obrasResult as typeof obras;
    for (const item of statusCounts) {
      const count = item._count._all;
      totalObras += count;
      if (item.status === "EM_ANDAMENTO") emAndamento = count;
      if (item.status === "CONCLUIDA") concluidas = count;
    }
  } catch (error) {
    console.error("Erro ao carregar dados da área do servidor:", error);
  }

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
            <div className={styles.profileIcon}>GP</div>
            <div>
              <strong>Gestão Pública</strong>
              <small>Área administrativa</small>
            </div>
          </div>
          <div className={styles.navList}>
            <span className={`${styles.navItem} ${styles.navItemActive}`}>
              Visão geral
            </span>
            <Link className={styles.navItem} href="/area-do-servidor/nova-obra">
              Cadastrar obra
            </Link>
          </div>
        </aside>
        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>
                Área administrativa <span>/</span> Visão geral
              </div>
              <h1 className={styles.pageTitle}>Obras e Projetos</h1>
              <p>
                Acompanhe as obras sob sua responsabilidade e registre novos
                projetos.
              </p>
            </div>
            <Link
              className={styles.primaryButton}
              href="/area-do-servidor/nova-obra"
            >
              Cadastrar obra
            </Link>
          </div>
          <section className={styles.metrics} aria-label="Resumo das obras">
            <div className={styles.metric}>
              <span>Total de obras</span>
              <strong>{totalObras}</strong>
            </div>
            <div className={styles.metric}>
              <span>Em andamento</span>
              <strong>{emAndamento}</strong>
            </div>
            <div className={styles.metric}>
              <span>Concluídas</span>
              <strong>{concluidas}</strong>
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardHeading}>
              <div>
                <h2>Obras recentes</h2>
                <p>Atualizadas mais recentemente</p>
              </div>
            </div>
            {obras.length ? (
              <div className={styles.workList}>
                {obras.map((obra) => (
                  <article className={styles.workRow} key={obra.id}>
                    <Link
                      className={styles.workRowLink}
                      href={`/area-do-servidor/obras/${obra.id}`}
                    >
                      <strong>{obra.titulo}</strong>
                      <span>{obra.secretaria.nome}</span>
                    </Link>
                    <div className={styles.workRowActions}>
                      <span className={styles.statusTag}>
                        {statusLabel[obra.status]}
                      </span>
                      <Link
                        className={styles.workAction}
                        href={`/area-do-servidor/obras/${obra.id}`}
                        title="Ver detalhes da obra"
                        aria-label={`Ver detalhes de ${obra.titulo}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                      </Link>
                      <Link
                        className={styles.workAction}
                        href={`/area-do-servidor/obras/${obra.id}?modo=editar`}
                        title="Editar obra"
                        aria-label={`Editar ${obra.titulo}`}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Link>
                      {isSecretaria && (
                        <DeleteObraButton obraId={obra.id} titulo={obra.titulo} />
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                Nenhuma obra disponível para este perfil.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
