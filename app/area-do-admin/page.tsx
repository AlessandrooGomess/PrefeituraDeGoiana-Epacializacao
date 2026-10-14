import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLANEJADA: "Em planejamento",
  ORDEM_EMITIDA: "Ordem emitida",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

export default async function AdminDashboard() {
  const [
    totalObras,
    usuariosAtivos,
    totalSecretarias,
    totalEixos,
    obrasRecentes,
  ] = await Promise.all([
    prisma.obra.count({ where: { deletedAt: null } }),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.secretaria.count(),
    prisma.eixoEstrategico.count(),
    prisma.obra.findMany({
      where: { deletedAt: null },
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
  ]);

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Visão geral
          </div>
          <h1 className={styles.pageTitle}>Visão Geral da Plataforma</h1>
          <p>
            Métricas consolidadas de todas as obras, secretarias e usuários da plataforma.
          </p>
        </div>
      </div>

      <section className={styles.metrics} aria-label="Resumo global">
        <div className={styles.metric}>
          <span>Total de Obras</span>
          <strong>{totalObras}</strong>
        </div>
        <div className={styles.metric}>
          <span>Usuários Ativos</span>
          <strong>{usuariosAtivos}</strong>
        </div>
        <div className={styles.metric}>
          <span>Secretarias</span>
          <strong>{totalSecretarias}</strong>
        </div>
        <div className={styles.metric}>
          <span>Eixos Estratégicos</span>
          <strong>{totalEixos}</strong>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Obras recentes na plataforma</h2>
            <p>Atualizadas mais recentemente por todas as secretarias</p>
          </div>
          <Link href="/area-do-admin/obras" className={styles.linkButton}>
            Ver todas as obras
          </Link>
        </div>
        
        {obrasRecentes.length ? (
          <div className={styles.workList}>
            {obrasRecentes.map((obra) => (
              <article className={styles.workRow} key={obra.id}>
                <div>
                  <strong>{obra.titulo}</strong>
                  <span>{obra.secretaria.nome}</span>
                </div>
                <span className={styles.statusTag}>
                  {STATUS_LABEL[obra.status] ?? obra.status}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            Nenhuma obra disponível na plataforma.
          </p>
        )}
      </section>
    </main>
  );
}
