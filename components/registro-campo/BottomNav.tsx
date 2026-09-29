import { AlertTriangle, BookOpen, CheckSquare, type LucideIcon } from "lucide-react";
import Link from "next/link";

type BottomNavTab = "diario" | "checklist" | "ouvidoria";

interface BottomNavProps {
  activeTab?: BottomNavTab;
}

// O "Início" fica no menu lateral (tablet/desktop) e na gaveta do cabeçalho (mobile)
const ABAS: { id: BottomNavTab; label: string; href: string; icon: LucideIcon }[] = [
  { id: "diario", label: "Diário", href: "/area-do-engenheiro/registro-campo", icon: BookOpen },
  { id: "checklist", label: "Checklist", href: "/area-do-engenheiro/checklist", icon: CheckSquare },
  { id: "ouvidoria", label: "Ouvidoria", href: "/area-do-engenheiro/ouvidoria", icon: AlertTriangle },
];

export function BottomNav({ activeTab = "diario" }: BottomNavProps) {
  return (
    <nav
      aria-label="Seções do registro de campo"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white shadow-lg"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-4">
        {ABAS.map(({ id, label, href, icon: Icon }) => {
          const ativa = id === activeTab;

          return (
            <Link
              key={id}
              href={href}
              aria-current={ativa ? "page" : undefined}
              className={`flex min-w-20 flex-col items-center gap-1 border-b-2 pt-2.5 pb-2 text-[11px] md:text-xs transition-colors ${
                ativa
                  ? "border-blue-600 font-semibold text-blue-600"
                  : "border-transparent font-medium text-slate-500 hover:text-slate-800"
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
