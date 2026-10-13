import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { getHomeByRole } from "@/lib/auth/role-routes";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AreaDoPrefeitoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.GESTAO, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        user={{
          name: session.user.name ?? session.user.email ?? "Prefeito Municipal",
          role: session.user.role,
        }}
      />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div
              className={styles.profileIcon}
              style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}
            >
              PM
            </div>
            <div>
              <strong>Gabinete do Prefeito</strong>
              <small>Gestão Municipal</small>
            </div>
          </div>
          <div className={styles.navList}>
            <span className={`${styles.navItem} ${styles.navItemActive}`}>
              Visão Geral
            </span>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.breadcrumb}>
                Gabinete do Prefeito <span>/</span> Visão Geral
              </div>
              <h1 className={styles.pageTitle}>Área do Prefeito</h1>
              <p>
                Painel executivo da gestão municipal e acompanhamento integrado de Goiana.
              </p>
            </div>
          </div>

          {/* Área base para desenvolvimento do front-end da equipe */}
          <section
            className={styles.card}
            style={{
              padding: "64px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "360px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "#eff6ff",
                color: "#1d4ed8",
                display: "grid",
                placeItems: "center",
                marginBottom: "16px",
              }}
            >
              <LayoutDashboard size={28} />
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: "8px",
              }}
            >
              Base da Área do Prefeito pronta
            </h2>
            <p
              style={{
                maxWidth: "480px",
                margin: "0 auto",
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.6",
              }}
            >
              Esta página já está com controle de acesso para o perfil <strong>GESTAO</strong> e rota configurada em <code>/area-do-prefeito</code>. A equipe de front-end pode implementar aqui os cards, métricas e gráficos executivos.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

