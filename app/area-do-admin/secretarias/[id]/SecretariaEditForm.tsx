"use client";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { updateSecretaria, deleteSecretaria } from "../../actions";
import { useRouter } from "next/navigation";

export default function SecretariaEditForm({ secretaria }: { secretaria: any }) {
  const router = useRouter();

  return (
    <form action={async (data) => {
      await updateSecretaria(secretaria.id, data);
      alert("Secretaria atualizada com sucesso!");
    }} className={styles.form}>
      <div className={styles.field}>
        <span>Nome da Secretaria <b>*</b></span>
        <input name="nome" required defaultValue={secretaria.nome} />
      </div>
      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <span>Sigla <b>*</b></span>
          <input name="sigla" required defaultValue={secretaria.sigla} />
        </div>
        <div className={styles.field}>
          <span>Cor de Identificação</span>
          <input type="color" name="corIdentificacao" defaultValue={secretaria.corIdentificacao || "#94a3b8"} style={{ height: 40, padding: 2, cursor: "pointer" }} />
        </div>
      </div>
      <div className={styles.formFooter} style={{ marginTop: 20 }}>
        <div>
          <button
            type="button"
            className={styles.cancelButton}
            style={{ color: "#ef4444", borderColor: "#fecaca" }}
            onClick={async () => {
              if(confirm("Deseja mesmo excluir permanentemente esta secretaria? Isso pode afetar obras vinculadas a ela.")) {
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
