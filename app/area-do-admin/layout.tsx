import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import AdminInnerSidebar from "./AdminInnerSidebar";

export const metadata = {
  title: "Painel Admin — Obras Goiana",
  description: "Administração geral da plataforma",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <div className={styles.shell}>
      <Sidebar
        user={{
          name: session.user.name ?? session.user.email ?? "Administrador",
          role: session.user.role,
        }}
      />
      <div className={styles.body}>
        <AdminInnerSidebar />
        {children}
      </div>
    </div>
  );
}
