"use client";
import { useState } from "react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { createSecretaria } from "../actions";
import Link from "next/link";
import { Building2, Plus, ChevronRight } from "lucide-react";

export default function SecretariasClient({ secretarias }: { secretarias: any[] }) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Secretarias
          </div>
          <h1 className={styles.pageTitle}>Órgãos Municipais</h1>
          <p>Gerenciamento das secretarias cadastradas na plataforma.</p>
        </div>
        <div className={styles.headingActions}>
          <button onClick={() => setModalOpen(true)} className={styles.primaryButton}>
            <Plus size={16} /> Nova Secretaria
          </button>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Todas as Secretarias</h2>
            <p>Selecione uma secretaria para ver suas obras ou editar seus dados</p>
          </div>
        </div>

        {secretarias.length ? (
          <div className={styles.secretariaList}>
            {secretarias.map((sec) => (
              <Link href={`/area-do-admin/secretarias/${sec.id}`} className={styles.secretariaLink} key={sec.id} style={{ position: "relative", paddingRight: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, flexShrink: 0, borderRadius: "50%", background: sec.corIdentificacao || "#94a3b8" }} />
                  <strong>{sec.nome} ({sec.sigla})</strong>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <span className={styles.statusTag}>Obras: {sec._count?.obras || 0}</span>
                  <span className={styles.statusTag}>Usuários: {sec._count?.usuarios || 0}</span>
                </div>
                <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#cbd5e1" }}>
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Building2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
            <p>Nenhuma secretaria cadastrada.</p>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className={styles.card} style={{ width: "100%", maxWidth: 500, margin: 0 }}>
            <div className={styles.cardHeading}>
              <h2>Cadastrar Nova Secretaria</h2>
              <button onClick={() => setModalOpen(false)} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 20, color: "#64748b" }}>&times;</button>
            </div>
            <form action={async (data) => {
              await createSecretaria(data);
              setModalOpen(false);
            }} className={styles.form}>
              <div className={styles.field}>
                <span>Nome da Secretaria <b>*</b></span>
                <input name="nome" required placeholder="Ex: Secretaria de Saúde" />
              </div>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <span>Sigla <b>*</b></span>
                  <input name="sigla" required placeholder="Ex: SESAU" />
                </div>
                <div className={styles.field}>
                  <span>Cor de Identificação</span>
                  <input type="color" name="corIdentificacao" defaultValue="#0874d9" style={{ height: 40, padding: 2, cursor: "pointer" }} />
                </div>
              </div>
              <div className={styles.formFooter} style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.primaryButton}>
                    Salvar Secretaria
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
