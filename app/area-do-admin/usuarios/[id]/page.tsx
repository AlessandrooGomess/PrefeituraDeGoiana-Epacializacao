import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import Link from "next/link";
import { ArrowLeft, UserCircle } from "lucide-react";
import UsuarioEditForm from "./UsuarioEditForm";

export const dynamic = "force-dynamic";

export default async function UsuarioDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [usuario, secretarias] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: params.id },
      include: {
        secretaria: { select: { id: true, nome: true, sigla: true } },
      }
    }),
    prisma.secretaria.findMany({ orderBy: { nome: "asc" } })
  ]);

  if (!usuario) {
    return <main className={styles.main}><p>Usuário não encontrado.</p></main>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/area-do-admin/usuarios" style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ArrowLeft size={12} /> Voltar para Usuários
            </Link> <span>/</span> Detalhes
          </div>
          <h1 className={styles.pageTitle} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <UserCircle size={28} style={{ color: "#94a3b8" }} />
            {usuario.nome}
          </h1>
          <p>{usuario.email}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        
        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div>
              <h2>Editar Permissões e Dados</h2>
              <p>O acesso atual deste usuário está <strong>{usuario.ativo ? "ATIVO" : "INATIVO"}</strong>.</p>
            </div>
          </div>
          <UsuarioEditForm usuario={usuario} secretarias={secretarias} />
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <div>
              <h2>Resumo de Acesso</h2>
            </div>
          </div>
          <div className={styles.form}>
            <div className={styles.field}>
              <span>Status</span>
              <span className={styles.statusTag} style={{ display: "inline-block", background: usuario.ativo ? "#eef0f5" : "#fee2e2", color: usuario.ativo ? "#7c8799" : "#b91c1c", width: "max-content" }}>
                {usuario.ativo ? "Conta Ativa" : "Conta Desativada"}
              </span>
            </div>
            <div className={styles.field}>
              <span>Papel de Acesso (Role)</span>
              <span className={styles.statusTag} style={{ display: "inline-block", width: "max-content" }}>{usuario.role}</span>
            </div>
            {usuario.secretaria && (
              <div className={styles.field}>
                <span>Secretaria Vinculada</span>
                <strong>{usuario.secretaria.nome} ({usuario.secretaria.sigla})</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Este usuário apenas tem acesso a dados pertinentes a esta secretaria.</p>
              </div>
            )}
            {!usuario.secretaria && (
              <div className={styles.field}>
                <span>Secretaria Vinculada</span>
                <strong>Visualização Global</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Este usuário pode ver dados de todo o sistema.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
