"use client";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { updateUsuario, deleteUsuario, toggleUsuarioStatus } from "../../actions";
import { useRouter } from "next/navigation";

export default function UsuarioEditForm({ usuario, secretarias }: { usuario: any, secretarias: any[] }) {
  const router = useRouter();

  return (
    <form action={async (data) => {
      await updateUsuario(usuario.id, data);
      alert("Usuário atualizado com sucesso!");
    }} className={styles.form}>
      <div className={styles.field}>
        <span>Nome Completo <b>*</b></span>
        <input name="nome" required defaultValue={usuario.nome} />
      </div>
      <div className={styles.field}>
        <span>E-mail <b>*</b></span>
        <input type="email" name="email" required defaultValue={usuario.email} />
      </div>
      <div className={styles.fieldsGrid}>
        <div className={styles.field}>
          <span>Papel de Acesso <b>*</b></span>
          <select name="role" required defaultValue={usuario.role}>
            <option value="ENGENHEIRO">Engenheiro</option>
            <option value="ADM_SECRETARIA">Adm. da Secretaria</option>
            <option value="GESTAO">Gestão / Gabinete</option>
            <option value="SUPER_ADMIN">Super Administrador</option>
          </select>
        </div>
        <div className={styles.field}>
          <span>Vincular à Secretaria</span>
          <select name="secretariaId" defaultValue={usuario.secretariaId || ""}>
            <option value="">-- Global / Nenhuma --</option>
            {secretarias.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.sigla} - {sec.nome}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.formFooter} style={{ marginTop: 20 }}>
        <div>
          <button
            type="button"
            className={styles.cancelButton}
            style={{ color: "#ef4444", borderColor: "#fecaca" }}
            onClick={async () => {
              if(confirm("Deseja excluir permanentemente este usuário?")) {
                await deleteUsuario(usuario.id);
                router.push("/area-do-admin/usuarios");
              }
            }}
          >
            Excluir Usuário
          </button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button 
            type="button" 
            className={styles.secondaryButton} 
            onClick={async () => {
              await toggleUsuarioStatus(usuario.id, usuario.ativo);
            }}
          >
            {usuario.ativo ? "Desativar Acesso" : "Reativar Acesso"}
          </button>
          <button type="submit" className={styles.primaryButton}>
            Salvar Alterações
          </button>
        </div>
      </div>
    </form>
  );
}
