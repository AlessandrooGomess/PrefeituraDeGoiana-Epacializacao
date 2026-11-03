"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarSettingsFooter, {
  type SidebarSettingsUser,
} from "@/components/sidebar/SidebarSettingsFooter";
import { ITENS_NAVEGACAO_ENGENHEIRO, isItemNavegacaoAtivo } from "./navegacao";

interface EngenheiroNavLinksProps {
  user?: SidebarSettingsUser | null;
  // Chamado ao escolher um item, por exemplo para fechar a gaveta mobile
  onNavigate?: () => void;
}

// Lista de links compartilhada pelo menu lateral e pela gaveta mobile
export function EngenheiroNavLinks({ user = null, onNavigate }: EngenheiroNavLinksProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col justify-between h-full">
      <ul className="flex flex-col gap-1">
        {ITENS_NAVEGACAO_ENGENHEIRO.map(({ label, href, icon: Icon, disponivel }) => {
          const ativo = isItemNavegacaoAtivo(pathname, href);

          return (
            <li key={href}>
              {disponivel ? (
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                    ativo
                      ? "bg-[#eff6ff] text-(--cor-principal) font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-400 cursor-not-allowed"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
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

      <SidebarSettingsFooter user={user} onNavigate={onNavigate} />
    </div>
  );
}
