import { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { prisma } from "@/lib/prisma";
import styles from "./area-do-servidor.module.css";

export default async function AreaDoServidor() {
  const session = await auth();
  const allowedRoles: Role[] = [
    Role.SUPER_ADMIN,
    Role.GESTAO,
    Role.ADM_SECRETARIA,
    Role.ENGENHEIRO,
  ];

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  const where = {
    deletedAt: null,
    ...(session.user.role === Role.ADM_SECRETARIA || session.user.role === Role.ENGENHEIRO
      ? { secretariaId: session.user.secretariaId ?? undefined }
      : {}),
  };

  const [obras, totalObras, emAndamento, concluidas] = await Promise.all([
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
    prisma.obra.count({ where }),
    prisma.obra.count({ where: { ...where, status: "EM_ANDAMENTO" } }),
    prisma.obra.count({ where: { ...where, status: "CONCLUIDA" } }),
  ]);

  const statusLabel = {
    PLANEJADA: "Em planejamento",
    ORDEM_EMITIDA: "Ordem emitida",
    EM_ANDAMENTO: "Em andamento",
    PARALISADA: "Paralisada",
    CONCLUIDA: "Concluída",
  } as const;

  return (
    <div className={styles.shell}>
      <Sidebar user={{ name: session.user.name ?? session.user.email ?? "Usuário", role: session.user.role }} />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}><div className={styles.profileIcon}>GP</div><div><strong>Gestão Pública</strong><small>Área administrativa</small></div></div>
          <div className={styles.navList}><span className={`${styles.navItem} ${styles.navItemActive}`}>Visão geral</span><Link className={styles.navItem} href="/area-do-servidor/nova-obra">Cadastrar obra</Link></div>
        </aside>
        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div><div className={styles.breadcrumb}>Área administrativa <span>/</span> Visão geral</div><h1 className={styles.pageTitle}>Obras e Projetos</h1><p>Acompanhe as obras sob sua responsabilidade e registre novos projetos.</p></div>
            <Link className={styles.primaryButton} href="/area-do-servidor/nova-obra">Cadastrar obra</Link>
          </div>
          <section className={styles.metrics} aria-label="Resumo das obras">
            <div className={styles.metric}><span>Total de obras</span><strong>{totalObras}</strong></div>
            <div className={styles.metric}><span>Em andamento</span><strong>{emAndamento}</strong></div>
            <div className={styles.metric}><span>Concluídas</span><strong>{concluidas}</strong></div>
          </section>
          <section className={styles.card}>
            <div className={styles.cardHeading}><div><h2>Obras recentes</h2><p>Atualizadas mais recentemente</p></div></div>
            {obras.length ? (
              <div className={styles.workList}>
                {obras.map((obra) => <article className={styles.workRow} key={obra.id}><div><strong>{obra.titulo}</strong><span>{obra.secretaria.nome}</span></div><span className={styles.statusTag}>{statusLabel[obra.status]}</span></article>)}
              </div>
            ) : <p className={styles.emptyState}>Nenhuma obra disponível para este perfil.</p>}
          </section>
        </main>
      </div>
    </div>
  );
}