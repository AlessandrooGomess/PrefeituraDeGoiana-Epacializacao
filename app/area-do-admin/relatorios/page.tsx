import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RelatoriosAdminPage() {
  const obrasTotais = await prisma.obra.count({ where: { deletedAt: null } });

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Relatórios
          </div>
          <h1 className={styles.pageTitle}>Relatórios e Exportação</h1>
          <p>Emissão de relatórios gerenciais e exportação de dados.</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Exportar base de Obras</h2>
            <p>Baixe uma planilha completa com as {obrasTotais} obras ativas.</p>
          </div>
        </div>

        <div style={{ paddingTop: 10 }}>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            A exportação contém todos os dados técnicos: datas, valores, endereço, coordenadas, e informações das secretarias responsáveis.
          </p>
          <Link
            href="/api/obras"
            target="_blank"
            className={styles.primaryButton}
          >
            Baixar JSON completo (API)
          </Link>
        </div>
      </section>
    </main>
  );
}
