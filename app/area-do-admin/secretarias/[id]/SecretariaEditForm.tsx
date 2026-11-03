"use client";
import { useState } from "react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { updateSecretaria, deleteSecretaria } from "../../actions";
import { useRouter } from "next/navigation";

interface SecretariaData {
  id: string;
  nome: string;
  sigla: string;
  corIdentificacao: string | null;
  eixoId: string | null;
  areaTematicaId: string | null;
}

interface EixoOption {
  id: string;
  nome: string;
  areas: Array<{ id: string; nome: string }>;
}

export default function SecretariaEditForm({
  secretaria,
  eixos,
}: {
  secretaria: SecretariaData;
  eixos: EixoOption[];
}) {
  const router = useRouter();
  const [selectedEixoId, setSelectedEixoId] = useState(secretaria.eixoId ?? "");
  const [selectedAreaId, setSelectedAreaId] = useState(secretaria.areaTematicaId ?? "");

  const areasDisponiveis =
    eixos.find((e) => e.id === selectedEixoId)?.areas ?? [];

  return (
    <form
      action={async (data) => {
        await updateSecretaria(secretaria.id, data);
        alert("Secretaria atualizada com sucesso!");
      }}
      className={styles.form}
    >
      <div className={styles.field}>
        <span>
          Nome da Secretaria <b>*</b>
        </span>
        <input name="nome" required defaultValue={secretaria.nome} />
      </div>
      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <span>
            Sigla <b>*</b>
          </span>
          <input name="sigla" required defaultValue={secretaria.sigla} />
        </div>
        <div className={styles.field}>
          <span>Cor de Identificação</span>
          <input
            type="color"
            name="corIdentificacao"
            defaultValue={secretaria.corIdentificacao || "#94a3b8"}
            style={{ height: 40, padding: 2, cursor: "pointer" }}
          />
        </div>
      </div>
      <div className={styles.field}>
        <span>Eixo Estratégico</span>
        <select
          name="eixoId"
          value={selectedEixoId}
          onChange={(e) => {
            setSelectedEixoId(e.target.value);
            setSelectedAreaId("");
          }}
        >
          <option value="">-- Nenhum --</option>
          {eixos.map((eixo) => (
            <option key={eixo.id} value={eixo.id}>
              {eixo.nome}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <span>Área Temática</span>
        <select
          name="areaTematicaId"
          value={selectedAreaId}
          disabled={!selectedEixoId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
        >
          <option value="">
            {selectedEixoId
              ? "-- Selecione uma Área Temática --"
              : "-- Selecione um Eixo primeiro --"}
          </option>
          {areasDisponiveis.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nome}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formFooter} style={{ marginTop: 20 }}>
        <div>
          <button
            type="button"
            className={styles.cancelButton}
            style={{ color: "#ef4444", borderColor: "#fecaca" }}
            onClick={async () => {
              if (
                confirm(
                  "Deseja mesmo excluir permanentemente esta secretaria? Isso pode afetar obras vinculadas a ela.",
                )
              ) {
                await deleteSecretaria(secretaria.id);
                router.push("/area-do-admin/secretarias");
              }
            }}
          >
            Excluir Secretaria
          </button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className={styles.primaryButton}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </form>
  );
}

