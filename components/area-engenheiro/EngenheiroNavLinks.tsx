"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITENS_NAVEGACAO_ENGENHEIRO, isItemNavegacaoAtivo } from "./navegacao";

interface EngenheiroNavLinksProps {
  // Chamado ao escolher um item, por exemplo para fechar a gaveta mobile
  onNavigate?: () => void;
}

// Lista de links compartilhada pelo menu lateral e pela gaveta mobile
export function EngenheiroNavLinks({ onNavigate }: EngenheiroNavLinksProps) {
  const pathname = usePathname();

  return (
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
