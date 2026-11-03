"use client";

import { useEffect, useState } from "react";
import { ChevronUp, LogOut, Settings, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";

export interface SidebarSettingsUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface SidebarSettingsFooterProps {
  user?: SidebarSettingsUser | null;
  onNavigate?: () => void;
  className?: string;
}

const ROLE_DISPLAY_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Administrador Geral",
  GESTAO: "Gestão / Prefeito",
  ADM_SECRETARIA: "Secretaria Municipal",
  ENGENHEIRO: "Engenheiro Responsável",
};

export default function SidebarSettingsFooter({
  user: initialUser = null,
  onNavigate,
  className = "",
}: SidebarSettingsFooterProps) {
  const [open, setOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SidebarSettingsUser | null>(
    initialUser,
  );

  useEffect(() => {
    if (initialUser?.name || initialUser?.role) {
      return;
    }

    let active = true;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setSessionUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        }
      })
      .catch(() => {
        // Ignora silenciosamente falha de rede
      });

    return () => {
      active = false;
    };
  }, [initialUser]);

  const activeUser = initialUser ?? sessionUser;
  const userName = activeUser?.name || activeUser?.email || "Usuário autenticado";
  const roleLabel = activeUser?.role
    ? (ROLE_DISPLAY_LABEL[activeUser.role] ?? activeUser.role)
    : "Conta conectada";

  const handleLogout = () => {
    setOpen(false);
    onNavigate?.();
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <div
      className={`mt-auto pt-4 border-t border-slate-200/80 flex flex-col gap-2 ${className}`.trim()}
    >
      {open && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-xs flex flex-col gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/80">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"
              aria-hidden="true"
            >
              <UserRound className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-xs font-bold text-slate-900">
                {userName}
              </strong>
              <small className="block truncate text-[11px] font-medium text-slate-500">
                {roleLabel}
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Sair da conta</span>
          </button>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer ${
          open
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <Settings
            className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 ${
              open ? "rotate-45 text-blue-600" : "text-slate-500"
            }`}
            aria-hidden="true"
          />
          <span>Configurações</span>
        </span>
        <ChevronUp
          className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180 text-slate-700" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

