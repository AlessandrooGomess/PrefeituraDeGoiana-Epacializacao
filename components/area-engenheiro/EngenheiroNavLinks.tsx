"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ITENS_NAVEGACAO_ENGENHEIRO, isItemNavegacaoAtivo } from "./navegacao";

interface EngenheiroNavLinksProps {
  // Chamado ao escolher um item, por exemplo para fechar a gaveta mobile
  onNavigate?: () => void;
}

// Lista de links compartilhada pelo menu lateral e pela gaveta mobile
export function EngenheiroNavLinks({ onNavigate }: EngenheiroNavLinksProps) {
  const pathname = usePathname();
  const [configOpen, setConfigOpen] = useState(false);

  const handleLogout = () => {
    onNavigate?.();
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <ul className="flex flex-col gap-1">
      {ITENS_NAVEGACAO_ENGENHEIRO.map(({ label, href, icon: Icon, disponivel }) => {
        const ativo = isItemNavegacaoAtivo(pathname, href);
        const isConfiguracoes = label === "Configurações";

        if (isConfiguracoes) {
          return (
            <li key={href} className="pt-1 mt-1 border-t border-slate-200">
              <button
                type="button"
                aria-expanded={configOpen}
                onClick={() => setConfigOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  configOpen
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
                    configOpen ? "rotate-180 text-slate-700" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {configOpen && (
                <div className="mt-1 ml-4 border-l-2 border-slate-200 pl-3 py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              )}
            </li>
          );
        }

        return (
          <li key={href}>
            {disponivel ? (
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Em breve
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
