"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Sidebar.module.css";

export type SidebarUser = {
  name: string;
  role?: string | null;
  imageUrl?: string | null;
};

type SidebarProps = {
  user?: SidebarUser | null;
};

export default function Sidebar({ user = null }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={styles.sidebar}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/">
          Portal de Infraestrutura
        </Link>

        <nav className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`}>
          <Link className={pathname === "/" ? styles.active : ""} href="/">Mapa</Link>
          <Link className={pathname === "/projetos" ? styles.active : ""} href="/projetos">Projetos</Link>
          <Link className={pathname === "/area-do-servidor" ? styles.active : ""} href="/area-do-servidor">Área do Servidor</Link>
        </nav>

        {user && (
          <div className={styles.user}>
            <div className={styles.userText}>
              <strong>{user.name}</strong>
              {user.role && <small>{user.role}</small>}
            </div>
            <span className={styles.avatarFallback} aria-hidden="true">
              <UserRound size={17} />
            </span>
          </div>
        )}

        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}
