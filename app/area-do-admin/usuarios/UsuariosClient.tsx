"use client";
import { useState } from "react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { createUsuario } from "../actions";
import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { Role } from "@prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrador",
  GESTAO: "Gestão / Gabinete",
  ADM_SECRETARIA: "Adm. da Secretaria",
  ENGENHEIRO: "Engenheiro",
  CIDADAO: "Cidadão",
};

interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  secretaria?: {
    sigla: string;
    nome: string;
  } | null;
}

interface SecretariaResumo {
  id: string;
  sigla: string;
  nome: string;
}

export default function UsuariosClient({
  usuarios,
  secretarias,
}: {
  usuarios: UsuarioItem[];
  secretarias: SecretariaResumo[];
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState<string>("TODOS");

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      !busca.trim() ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      (u.secretaria?.sigla.toLowerCase().includes(busca.toLowerCase()) ?? false) ||
      (u.secretaria?.nome.toLowerCase().includes(busca.toLowerCase()) ?? false);
    const matchRole = roleFiltro === "TODOS" || u.role === roleFiltro;
    return matchBusca && matchRole;
  });

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Usuários
          </div>
          <h1 className={styles.pageTitle}>Gerenciamento de Usuários</h1>
          <p>Visualize, cadastre e gerencie o acesso das pessoas ao sistema.</p>
        </div>
        <div className={styles.headingActions}>
          <button onClick={() => setModalOpen(true)} className={styles.primaryButton}>
            <UserPlus size={16} /> Novo Usuário
          </button>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading} style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2>Todos os Usuários</h2>
            <p>{usuariosFiltrados.length} de {usuarios.length} usuário(s) exibido(s)</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Buscar por nome, e-mail ou secretaria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                minHeight: 38,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                minWidth: 240,
              }}
            />
            <select
              value={roleFiltro}
              onChange={(e) => setRoleFiltro(e.target.value)}
              style={{
                minHeight: 38,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                background: "#fff",
              }}
            >
              <option value="TODOS">Todos os papéis</option>
              <option value="SUPER_ADMIN">Super Administrador</option>
              <option value="GESTAO">Gestão / Gabinete</option>
              <option value="ADM_SECRETARIA">Adm. da Secretaria</option>
              <option value="ENGENHEIRO">Engenheiro</option>
            </select>
          </div>
        </div>

        {usuariosFiltrados.length ? (
          <div className={styles.workList}>
            {usuariosFiltrados.map((user) => (
              <Link 
                href={`/area-do-admin/usuarios/${user.id}`} 
                className={styles.workRow} 
                key={user.id} 
                style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 12px", margin: "0 -12px", borderRadius: 8 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div>
                  <strong>{user.nome}</strong>
                  <span>{user.email}</span>
                  {user.secretaria && (
                    <span>Secretaria: {user.secretaria.sigla} - {user.secretaria.nome}</span>
                  )}
                </div>
                <div style={{ textAlign: "right", display: "flex", gap: 8, alignItems: "center" }}>
                  <div>
                    <span className={styles.statusTag} style={{ display: "block", marginBottom: 4 }}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                    <span className={styles.statusTag} style={{ display: "block", background: user.ativo ? "#dcfce7" : "#fee2e2", color: user.ativo ? "#15803d" : "#b91c1c" }}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <ChevronRight size={20} style={{ color: "#cbd5e1", marginLeft: 8 }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhum usuário encontrado para os filtros aplicados.</p>
        )}
      </section>

      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div className={styles.card} style={{ width: "100%", maxWidth: 500, margin: 0, maxHeight: "90vh", overflow: "auto" }}>
            <div className={styles.cardHeading}>
              <h2>Cadastrar Novo Usuário</h2>
              <button onClick={() => setModalOpen(false)} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 20, color: "#64748b" }}>&times;</button>
            </div>
            <form action={async (data) => {
              await createUsuario(data);
              setModalOpen(false);
            }} className={styles.form}>
              <div className={styles.field}>
                <span>Nome Completo <b>*</b></span>
                <input name="nome" required placeholder="Ex: João da Silva" />
              </div>
              <div className={styles.field}>
                <span>E-mail <b>*</b></span>
                <input type="email" name="email" required placeholder="joao@goiana.pe.gov.br" />
              </div>
              <div className={styles.field}>
                <span>Senha Provisória (mín. 6 caracteres) <b>*</b></span>
                <input type="password" name="password" minLength={6} required placeholder="Senha provisória" />
              </div>
              <div className={styles.field}>
                <span>Papel de Acesso <b>*</b></span>
                <select name="role" required>
                  <option value="ENGENHEIRO">Engenheiro</option>
                  <option value="ADM_SECRETARIA">Adm. da Secretaria</option>
                  <option value="GESTAO">Gestão / Gabinete</option>
                  <option value="SUPER_ADMIN">Super Administrador</option>
                </select>
              </div>
              <div className={styles.field}>
                <span>Vincular à Secretaria (Opcional)</span>
                <select name="secretariaId">
                  <option value="">-- Nenhuma / Gestão Global --</option>
                  {secretarias.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.sigla} - {sec.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formFooter} style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button type="button" onClick={() => setModalOpen(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                  <button type="submit" className={styles.primaryButton}>
                    Cadastrar Usuário
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

