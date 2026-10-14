import { AlertTriangle, BookOpen, CheckSquare, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type BottomNavTab = "diario" | "checklist" | "ouvidoria";

interface BottomNavProps {
  // Sem aba ativa em telas fora das seções da barra (ex.: Início)
  activeTab?: BottomNavTab;
}

// O "Início" fica no menu lateral (tablet/desktop) e na gaveta do cabeçalho (mobile)
// Abas ainda sem página aparecem desabilitadas com a indicação "Em breve"
const ABAS: { id: BottomNavTab; label: string; href: string; icon: LucideIcon; disponivel: boolean }[] = [
  { id: "diario", label: "Diário", href: "/area-do-engenheiro/registro-campo", icon: BookOpen, disponivel: true },
  { id: "checklist", label: "Checklist", href: "/area-do-engenheiro/checklist", icon: CheckSquare, disponivel: false },
  { id: "ouvidoria", label: "Ouvidoria", href: "/area-do-engenheiro/ouvidoria", icon: AlertTriangle, disponivel: false },
];

export function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Seções do registro de campo"
      className="fixed inset-x-0 bottom-0 z-30 bg-(--cor-header-footer) shadow-lg"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-4">
        {ABAS.map(({ id, label, href, icon: Icon, disponivel }) => {
          const ativa = id === activeTab;

          if (!disponivel) {
            return (
              <span
                key={id}
                aria-disabled="true"
                className="relative flex min-w-20 cursor-not-allowed flex-col items-center gap-1 border-b-2 border-transparent pt-2.5 pb-2 text-[11px] md:text-xs font-medium text-white/50"
              >
                <span className="absolute top-0.5 right-0 rounded-full bg-white px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-(--cor-header-footer)">
                  Em breve
                </span>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </span>
            );
          }

          return (
            <Link
              key={id}
              href={href}
              aria-current={ativa ? "page" : undefined}
              className={`flex min-w-20 flex-col items-center gap-1 border-b-2 pt-2.5 pb-2 text-[11px] md:text-xs transition-colors ${
                ativa
                  ? "border-white font-semibold text-white"
                  : "border-transparent font-medium text-white/70 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
