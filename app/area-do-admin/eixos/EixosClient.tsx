"use client";
import { useState } from "react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { createEixo } from "../actions";
import Link from "next/link";
import { FolderPlus, ChevronRight } from "lucide-react";

export default function EixosClient({ eixos }: { eixos: any[] }) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Eixos Estratégicos
          </div>
          <h1 className={styles.pageTitle}>Eixos Estratégicos</h1>
          <p>Eixos de planejamento e suas áreas temáticas.</p>
        </div>
        <div className={styles.headingActions}>
          <button onClick={() => setModalOpen(true)} className={styles.primaryButton}>
            <FolderPlus size={16} /> Novo Eixo
          </button>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Todos os Eixos</h2>
            <p>{eixos.length} eixo(s) cadastrado(s)</p>
          </div>
        </div>

        {eixos.length ? (
          <div className={styles.workList}>
            {eixos.map((eixo) => (
              <Link 
                href={`/area-do-admin/eixos/${eixo.id}`} 
                className={styles.workRow} 
                key={eixo.id} 
                style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 12px", margin: "0 -12px", borderRadius: 8 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div>
                  <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: eixo.cor || "#10b981", flexShrink: 0 }} />
                    {eixo.nome}
                  </strong>
                  <span>{eixo.descricao || `Slug: ${eixo.slug}`}</span>
                  {eixo.areas.length > 0 && (
                    <span style={{ marginTop: 4 }}>Áreas: {eixo.areas.map((a: any) => a.nome).join(", ")}</span>
                  )}
                </div>
                <div style={{ textAlign: "right", display: "flex", gap: 12 }}>
                  <span className={styles.statusTag}>
                    Obras: {eixo._count.obras}
                  </span>
                  <span className={styles.statusTag}>
                    Secretarias: {eixo._count.secretarias}
                  </span>
                  <ChevronRight size={20} style={{ color: "#cbd5e1", marginLeft: 8 }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhum eixo estratégico cadastrado.</p>
        )}
      </section>

      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className={styles.card} style={{ width: "100%", maxWidth: 500, margin: 0, maxHeight: "90vh", overflow: "auto" }}>
            <div className={styles.cardHeading}>
              <h2>Cadastrar Novo Eixo Estratégico</h2>
              <button onClick={() => setModalOpen(false)} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 20, color: "#64748b" }}>&times;</button>
            </div>
            <form action={async (data) => {
              await createEixo(data);
              setModalOpen(false);
            }} className={styles.form}>
              <div className={styles.field}>
                <span>Nome do Eixo <b>*</b></span>
                <input name="nome" required placeholder="Ex: Infraestrutura e Mobilidade" />
              </div>
              <div className={styles.field}>
                <span>Slug <b>*</b></span>
                <input name="slug" required placeholder="Ex: infraestrutura-mobilidade" />
              </div>
              <div className={styles.field}>
                <span>Descrição (Opcional)</span>
                <textarea name="descricao" placeholder="Descreva o propósito deste eixo estratégico..." />
              </div>
              <div className={styles.field}>
                <span>Cor de Identificação</span>
                <input type="color" name="cor" defaultValue="#10b981" style={{ height: 40, padding: 2 }} />
              </div>
              <div className={styles.formFooter} style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.primaryButton}>
                    Cadastrar Eixo
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
