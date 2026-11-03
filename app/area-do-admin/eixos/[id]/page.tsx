import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, ChevronRight } from "lucide-react";
import EixoEditForm from "./EixoEditForm";
import AreasTematicasSection from "./AreasTematicasSection";

export const dynamic = "force-dynamic";

export default async function EixoDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const eixo = await prisma.eixoEstrategico.findUnique({
    where: { id: params.id },
    include: {
      areas: {
        orderBy: { nome: "asc" },
        select: { id: true, nome: true },
      },
      secretarias: {
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, sigla: true },
      },
      obras: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        select: { id: true, titulo: true, status: true, bairro: true },
      },
    },
  });

  if (!eixo) {
    return (
      <main className={styles.main}>
        <p>Eixo Estratégico não encontrado.</p>
      </main>
    );
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
            <Link
              href="/area-do-admin/eixos"
              style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <ArrowLeft size={12} /> Voltar para Eixos
            </Link>{" "}
            <span>/</span> Detalhes
          </div>
          <h1 className={styles.pageTitle} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: eixo.cor || "#10b981", flexShrink: 0 }} />
            {eixo.nome}
          </h1>
          <p>{eixo.descricao || `Identificador: ${eixo.slug}`}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2>Editar Dados</h2>
          </div>
          <EixoEditForm eixo={eixo} />
        </section>

        <div style={{ display: "grid", gap: 24 }}>
          <AreasTematicasSection eixoId={eixo.id} areas={eixo.areas} />

          <section className={styles.card} style={{ marginBottom: 0 }}>
            <div className={styles.cardHeading}>
              <div>
                <h2>Obras Vinculadas</h2>
                <p>Total de {eixo.obras.length} obra(s) relacionadas a este eixo.</p>
              </div>
            </div>

            {eixo.obras.length ? (
              <div className={styles.workList}>
                {eixo.obras.map((obra) => (
                  <article className={styles.workRow} key={obra.id}>
                    <Link
                      href={`/area-do-servidor/obras/${obra.id}`}
                      className={styles.workRowLink}
                    >
                      <strong>{obra.titulo}</strong>
                      <span>{obra.bairro}</span>
                    </Link>
                    <div className={styles.workRowActions}>
                      <span className={styles.statusTag}>
                        {STATUS_LABEL[obra.status] || obra.status}
                      </span>
                      <Link
                        className={styles.workAction}
                        href={`/area-do-servidor/obras/${obra.id}`}
                        title="Ver detalhes da obra"
                      >
                        <Eye size={16} aria-hidden="true" />
                      </Link>
                      <Link
                        className={styles.workAction}
                        href={`/area-do-servidor/obras/${obra.id}?modo=editar`}
                        title="Editar obra"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhuma obra vinculada.</p>
              </div>
            )}
          </section>

          <section className={styles.card} style={{ marginBottom: 0 }}>
            <div className={styles.cardHeading}>
              <div>
                <h2>Secretarias Envolvidas</h2>
                <p>{eixo.secretarias.length} secretaria(s) vinculada(s).</p>
              </div>
            </div>

            {eixo.secretarias.length ? (
              <div className={styles.workList}>
                {eixo.secretarias.map((sec) => (
                  <Link
                    href={`/area-do-admin/secretarias/${sec.id}`}
                    className={styles.workRow}
                    key={sec.id}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      <strong>{sec.nome}</strong>
                      <span>{sec.sigla}</span>
                    </div>
                    <ChevronRight size={18} style={{ color: "#94a3b8" }} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhuma secretaria vinculada.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

