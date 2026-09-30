import { ClipboardList, FileBarChart, Home, Map as MapIcon, Settings, type LucideIcon } from "lucide-react";

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
  { label: "Registros", href: "/area-do-engenheiro/registros", icon: ClipboardList, disponivel: false },
  { label: "Mapa", href: "/", icon: MapIcon, disponivel: true },
  { label: "Relatórios", href: "/area-do-engenheiro/relatorios", icon: FileBarChart, disponivel: false },
  { label: "Configurações", href: "/area-do-engenheiro/configuracoes", icon: Settings, disponivel: false },
];

export function isItemNavegacaoAtivo(pathname: string, href: string): boolean {
  return pathname === href;
}
