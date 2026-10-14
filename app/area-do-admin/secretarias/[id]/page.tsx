import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import SecretariaEditForm from "./SecretariaEditForm";

export const dynamic = "force-dynamic";

export default async function SecretariaDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const secretaria = await prisma.secretaria.findUnique({
    where: { id: params.id },
    include: {
      obras: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, titulo: true, status: true, bairro: true }
      }
    }
  });

  if (!secretaria) {
    return <main className={styles.main}><p>Secretaria não encontrada.</p></main>;
  }

  const STATUS_LABEL: Record<string, string> = {
    PLANEJADA: "Planejada",
    ORDEM_EMITIDA: "Ordem emitida",
    EM_ANDAMENTO: "Em andamento",
    PARALISADA: "Paralisada",
    CONCLUIDA: "Concluída",
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/area-do-admin/secretarias" style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ArrowLeft size={12} /> Voltar para Secretarias
            </Link> <span>/</span> Detalhes
          </div>
          <h1 className={styles.pageTitle} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: secretaria.corIdentificacao || "#94a3b8" }} />
            {secretaria.nome}
          </h1>
          <p>Sigla: {secretaria.sigla}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
        
        {/* Formulário de Edição */}
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2>Editar Dados</h2>
          </div>
          <SecretariaEditForm secretaria={secretaria} />
        </section>

        {/* Lista de Obras da Secretaria */}
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div>
              <h2>Obras Vinculadas</h2>
              <p>Total de {secretaria.obras.length} obra(s) gerida(s) por esta secretaria.</p>
            </div>
          </div>

          {secretaria.obras.length ? (
            <div className={styles.workList}>
              {secretaria.obras.map(obra => (
                <article className={styles.workRow} key={obra.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <MapPin size={18} style={{ color: "#94a3b8" }} />
                    <div>
                      <strong>{obra.titulo}</strong>
                      <span>{obra.bairro}</span>
                    </div>
                  </div>
                  <span className={styles.statusTag}>
                    {STATUS_LABEL[obra.status] || obra.status}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhuma obra vinculada a esta secretaria no momento.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
