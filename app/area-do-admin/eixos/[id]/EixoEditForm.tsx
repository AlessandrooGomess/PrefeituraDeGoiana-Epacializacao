"use client";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { updateEixo, deleteEixo } from "../../actions";
import { useRouter } from "next/navigation";

export default function EixoEditForm({ eixo }: { eixo: any }) {
  const router = useRouter();

  return (
    <form action={async (data) => {
      await updateEixo(eixo.id, data);
      alert("Eixo Estratégico atualizado com sucesso!");
    }} className={styles.form}>
      <div className={styles.field}>
        <span>Nome do Eixo <b>*</b></span>
        <input name="nome" required defaultValue={eixo.nome} />
      </div>
      <div className={styles.field}>
        <span>Slug <b>*</b></span>
        <input name="slug" required defaultValue={eixo.slug} />
      </div>
      <div className={styles.field}>
        <span>Descrição (Opcional)</span>
        <textarea name="descricao" defaultValue={eixo.descricao || ""} />
      </div>
      <div className={styles.field}>
        <span>Cor de Identificação</span>
        <input type="color" name="cor" defaultValue={eixo.cor || "#10b981"} style={{ height: 40, padding: 2, cursor: "pointer" }} />
      </div>
      <div className={styles.formFooter} style={{ marginTop: 20 }}>
        <div>
          <button
            type="button"
            className={styles.cancelButton}
            style={{ color: "#ef4444", borderColor: "#fecaca" }}
            onClick={async () => {
              if(confirm("Deseja mesmo excluir permanentemente este eixo estratégico? Isso pode afetar obras e secretarias vinculadas.")) {
                await deleteEixo(eixo.id);
                router.push("/area-do-admin/eixos");
              }
            }}
          >
            Excluir Eixo
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
