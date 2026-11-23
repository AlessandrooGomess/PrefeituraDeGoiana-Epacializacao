import { Home, type LucideIcon } from "lucide-react";

export interface ItemNavegacaoEngenheiro {
  label: string;
  href: string;
  icon: LucideIcon;
  // Itens ainda sem página aparecem desabilitados com a indicação "Em breve"
  disponivel: boolean;
}

// Fonte única dos itens do menu da área do engenheiro (menu lateral e gaveta mobile)
export const ITENS_NAVEGACAO_ENGENHEIRO: ItemNavegacaoEngenheiro[] = [
  { label: "Início", href: "/area-do-engenheiro", icon: Home, disponivel: true },
];

export function isItemNavegacaoAtivo(pathname: string, href: string): boolean {
  return pathname === href;
}
