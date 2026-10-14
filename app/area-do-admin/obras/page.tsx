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

export default async function ObrasAdminPage() {
  const obras = await prisma.obra.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      secretaria: { select: { nome: true } },
    }
  });

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Obras
          </div>
          <h1 className={styles.pageTitle}>Gerenciamento de Obras</h1>
          <p>Visualize e acesse todas as obras da plataforma.</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Todas as obras cadastradas</h2>
            <p>{obras.length} obra(s) encontrada(s)</p>
          </div>
        </div>
        
        {obras.length ? (
          <div className={styles.workList}>
            {obras.map((obra) => (
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
            Nenhuma obra encontrada.
          </p>
        )}
      </section>
    </main>
  );
}
