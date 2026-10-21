"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";

const navItems = [
  { href: "/area-do-admin", label: "Visão geral" },
  { href: "/area-do-admin/obras", label: "Obras cadastradas" },
  { href: "/area-do-admin/secretarias", label: "Secretarias" },
  { href: "/area-do-admin/eixos", label: "Eixos Estratégicos" },
  { href: "/area-do-admin/usuarios", label: "Usuários" },
  { href: "/area-do-admin/relatorios", label: "Relatórios e Exportação" },
];

export default function AdminInnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.profileIcon} style={{ background: "#475569" }}>SA</div>
        <div>
          <strong>Super Admin</strong>
          <small>Administração Geral</small>
        </div>
      </div>
      <div className={styles.navList}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${
              pathname === item.href ? styles.navItemActive : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
