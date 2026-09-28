import { Role } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { prisma } from "@/lib/prisma";
import styles from "./area-do-servidor.module.css";

export default async function AreaDoServidor() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === Role.ENGENHEIRO) {
    redirect("/area-do-engenheiro");
  }

  const allowedRoles: Role[] = [Role.ADM_SECRETARIA];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  if (!session.user.secretariaId) redirect("/");

  const secretaria = await prisma.secretaria.findUnique({
    where: { id: session.user.secretariaId },
    select: { nome: true, sigla: true },
  });

  if (!secretaria) {
    redirect("/login");
  }

  const where = {
    deletedAt: null,
    secretariaId: session.user.secretariaId,
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
  };

  return (
    <div className={styles.container}>
      <Sidebar user={{ name: session.user.name ?? session.user.email ?? "Usuário", role: session.user.role }} />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Área do Servidor</h1>
            <p className={styles.subtitle}>
              Painel de gestão de obras — <strong>{secretaria.nome} ({secretaria.sigla})</strong>
            </p>
          </div>
          <Link href="/area-do-servidor/nova-obra" className={styles.button}>
            Cadastrar Nova Obra
          </Link>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Total de Obras</span>
            <span className={styles.kpiValue}>{totalObras}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Em Andamento</span>
            <span className={styles.kpiValue}>{emAndamento}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Concluídas</span>
            <span className={styles.kpiValue}>{concluidas}</span>
          </div>
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Últimas Obras Atualizadas</h2>
        </div>

        {obras.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Nenhuma obra cadastrada para esta secretaria.</p>
            <Link href="/area-do-servidor/nova-obra" className={styles.button}>
              Cadastrar primeira obra
            </Link>
          </div>
        ) : (
          <div className={styles.obraList}>
            {obras.map((obra) => (
              <div key={obra.id} className={styles.obraItem}>
                <div className={styles.obraInfo}>
                  <span className={styles.obraTitulo}>{obra.titulo}</span>
                  <span className={styles.obraMeta}>
                    Atualizada em {new Date(obra.updatedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <span className={`${styles.statusBadge} ${styles[obra.status.toLowerCase()]}`}>
                  {statusLabel[obra.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}