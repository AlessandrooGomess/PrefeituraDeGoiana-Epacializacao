"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITENS_NAVEGACAO_ENGENHEIRO, isItemNavegacaoAtivo } from "./navegacao";

// Menu lateral exibido a partir do tablet; no mobile a navegação fica na gaveta do cabeçalho
export function EngenheiroSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-slate-200 bg-white">
      <nav aria-label="Menu da área do engenheiro" className="sticky top-14 flex flex-col gap-1 p-3">
        {ITENS_NAVEGACAO_ENGENHEIRO.map(({ label, href, icon: Icon, disponivel }) => {
          const ativo = isItemNavegacaoAtivo(pathname, href);

          if (!disponivel) {
            return (
              <span
                key={href}
                aria-disabled="true"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Em breve
                </span>
              </span>
            );
          }

          return (
            <Link
              key={href}
              href={href}
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
          );
        })}
      </nav>
    </aside>
  );
}
