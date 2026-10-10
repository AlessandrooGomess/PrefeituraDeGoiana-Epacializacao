"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import sidebarStyles from "./Sidebar.module.css";
import portalStyles from "@/app/portal.module.css";
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

export default function Sidebar({ user = null, toolsNode }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setMenuOpen(false);

  const areaHref = user?.role ? getHomeByRole(user.role) : SERVIDOR_HOME;
  const areaLabel =
    user?.role === "ENGENHEIRO" ? "Minha Área" : "Área do Servidor";
  const areaActive =
    areaHref !== "/" && pathname.startsWith(areaHref);

  return (
    <header className={portalStyles["portal-header"]}>
      <Link href="/" aria-label="Goianapá" className="flex items-center">
        <img
          className="mt-1 w-[111px] h-[57px] ml-8 aspect-[1.93] object-cover"
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
      </nav>

      <div className={portalStyles["portal-tools"]}>
        {toolsNode}
        {user && (
          <div className={sidebarStyles.user}>
            <div className={sidebarStyles.userText}>
              <strong>{user.name}</strong>
              {user.role && <small>{user.role}</small>}
            </div>
            <span className={sidebarStyles.avatarFallback} aria-hidden="true">
              <UserRound size={17} />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
