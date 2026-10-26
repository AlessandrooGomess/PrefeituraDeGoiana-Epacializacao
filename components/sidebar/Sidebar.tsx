"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import sidebarStyles from "./Sidebar.module.css";
import portalStyles from "@/app/portal.module.css";
import { PORTAL_FOOTER_LINKS } from "@/components/portal/PortalFooter";
import { getHomeByRole, SERVIDOR_HOME } from "@/lib/auth/role-routes";

export type SidebarUser = {
  name: string;
  role?: string | null;
  imageUrl?: string | null;
};

type SidebarProps = {
  user?: SidebarUser | null;
  toolsNode?: React.ReactNode;
};

const ROLE_DISPLAY_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Administrador Geral",
  GESTAO: "Gestão / Prefeito",
  ADM_SECRETARIA: "Secretaria Municipal",
  ENGENHEIRO: "Engenheiro Responsável",
};

export default function Sidebar({ user = null, toolsNode }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileSettingsOpen(false);
  };

  useEffect(() => {
    if (!settingsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        settingsRef.current &&
        event.target instanceof Node &&
        !settingsRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  const handleLogout = () => {
    setSettingsOpen(false);
    closeMenu();
    void signOut({ callbackUrl: "/login" });
  };

  const roleLabel = user?.role
    ? (ROLE_DISPLAY_LABEL[user.role] ?? user.role)
    : null;

  const areaHref = user?.role ? getHomeByRole(user.role) : SERVIDOR_HOME;
  const areaLabel =
    user?.role === "ENGENHEIRO"
      ? "Minha Área"
      : user?.role === "GESTAO"
        ? "Área do Prefeito"
        : user?.role === "SUPER_ADMIN"
          ? "Painel Admin"
          : "Área do Servidor";
  const areaActive =
    areaHref !== "/" && pathname.startsWith(areaHref);

  return (
    <header className={portalStyles["portal-header"]}>
      <Link href="/" aria-label="Goianapá" className="flex shrink-0 items-center">
        <img
          className="mt-1 w-[111px] h-[57px] ml-8 aspect-[1.93] object-cover max-[720px]:mt-0 max-[720px]:ml-0 max-[720px]:w-20 max-[720px]:h-[41px]"
          alt="Logo Goianapá"
          src="/logo-goiana.png"
        />
      </Link>
      <div className={portalStyles["portal-brand"]}>PORTAL DE INFRAESTRUTURA</div>

      <button
        className={portalStyles["menu-toggle"]}
        type="button"
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
      </button>

      <nav
        className={menuOpen ? portalStyles["is-open"] : ""}
      >
        <Link className={pathname === "/" ? portalStyles.active : ""} href="/" onClick={closeMenu}>
          Mapa
        </Link>
        <Link
          className={pathname === "/projetos" ? portalStyles.active : ""}
          href="/projetos"
          onClick={closeMenu}
        >
          Projetos
        </Link>
        <Link className={areaActive ? portalStyles.active : ""} href={areaHref} onClick={closeMenu}>
          {areaLabel}
        </Link>

        {user && (
          <div className={sidebarStyles.mobileSettingsSection}>
            <button
              type="button"
              className={sidebarStyles.mobileSettingsTrigger}
              aria-expanded={mobileSettingsOpen}
              onClick={() => setMobileSettingsOpen((prev) => !prev)}
            >
              <span className={sidebarStyles.mobileSettingsTriggerLabel}>
                <Settings size={16} aria-hidden="true" />
                Configurações
              </span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-150 ${mobileSettingsOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {mobileSettingsOpen && (
              <div className={sidebarStyles.mobileSettingsPanel}>
                <div className={sidebarStyles.mobileSettingsUser}>
                  <strong>{user.name}</strong>
                  {roleLabel && <small>{roleLabel}</small>}
                </div>
                <button
                  type="button"
                  className={sidebarStyles.mobileLogoutButton}
                  onClick={handleLogout}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        )}

        <div className={portalStyles["mobile-menu-footer"]}>
          <span className={portalStyles["mobile-menu-footer-title"]}>Institucional</span>
          <div className={portalStyles["mobile-menu-footer-links"]}>
            {PORTAL_FOOTER_LINKS.map(({ href, label }) => (
              <a key={href} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className={portalStyles["portal-tools"]}>
        {toolsNode}
        {user && (
          <div ref={settingsRef} className={sidebarStyles.userWrapper}>
            <button
              type="button"
              className={sidebarStyles.user}
              aria-label="Configurações da conta"
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              onClick={() => setSettingsOpen((prev) => !prev)}
            >
              <div className={sidebarStyles.userText}>
                <strong>{user.name}</strong>
                {roleLabel && <small>{roleLabel}</small>}
              </div>
              <span className={sidebarStyles.avatarFallback} aria-hidden="true">
                <UserRound size={17} />
              </span>
              <Settings
                size={16}
                aria-hidden="true"
                className={`${sidebarStyles.settingsIcon} ${settingsOpen ? sidebarStyles.settingsIconOpen : ""}`}
              />
            </button>

            {settingsOpen && (
              <div
                role="menu"
                aria-label="Configurações da conta"
                className={sidebarStyles.settingsDropdown}
              >
                <div className={sidebarStyles.settingsHeader}>
                  <span className={sidebarStyles.settingsTitle}>Configurações da conta</span>
                  <strong className={sidebarStyles.settingsUserName}>{user.name}</strong>
                  {roleLabel && (
                    <span className={sidebarStyles.settingsUserRole}>{roleLabel}</span>
                  )}
                </div>
                <div className={sidebarStyles.settingsActions}>
                  <button
                    type="button"
                    role="menuitem"
                    className={sidebarStyles.settingsLogoutButton}
                    onClick={handleLogout}
                  >
                    <LogOut size={15} aria-hidden="true" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
