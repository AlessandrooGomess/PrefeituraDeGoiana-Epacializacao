"use client";

import { useRef } from "react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { createAreaTematica, deleteAreaTematica } from "../../actions";
import { Plus, Trash2 } from "lucide-react";

interface AreaTematicaItem {
  id: string;
  nome: string;
}

export default function AreasTematicasSection({
  eixoId,
  areas,
}: {
  eixoId: string;
  areas: AreaTematicaItem[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className={styles.card} style={{ marginBottom: 0 }}>
      <div className={styles.cardHeading}>
        <div>
          <h2>Áreas Temáticas</h2>
          <p>{areas.length} área(s) temática(s) cadastrada(s) neste eixo.</p>
        </div>
      </div>

      <form
        ref={formRef}
        action={async (data) => {
          await createAreaTematica(eixoId, data);
          formRef.current?.reset();
        }}
        style={{ display: "flex", gap: 10, marginBottom: 16 }}
      >
        <input
          name="nome"
          required
          placeholder="Nova área temática (ex: Atenção Básica, Pavimentação...)"
          style={{
            flex: 1,
            minHeight: 40,
            padding: "0 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            fontSize: 13,
          }}
        />
        <button type="submit" className={styles.primaryButton}>
          <Plus size={16} /> Adicionar
        </button>
      </form>

      {areas.length ? (
        <div className={styles.workList}>
          {areas.map((area) => (
            <article className={styles.workRow} key={area.id}>
              <div>
                <strong>{area.nome}</strong>
              </div>
              <button
                type="button"
                title="Remover área temática"
                onClick={async () => {
                  if (confirm(`Deseja remover a área temática "${area.nome}"?`)) {
                    await deleteAreaTematica(area.id, eixoId);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Nenhuma área temática cadastrada para este eixo.</p>
        </div>
      )}
    </section>
  );
}

