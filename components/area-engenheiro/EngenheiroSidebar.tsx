import type { SidebarSettingsUser } from "@/components/sidebar/SidebarSettingsFooter";
import { EngenheiroNavLinks } from "./EngenheiroNavLinks";

interface EngenheiroSidebarProps {
  user?: SidebarSettingsUser | null;
}

// Menu lateral exibido no desktop (alinhado ao breakpoint de 720px do cabeçalho padrão)
export function EngenheiroSidebar({ user = null }: EngenheiroSidebarProps) {
  return (
    <aside className="hidden min-[721px]:flex min-[721px]:flex-col w-[254px] shrink-0 border-r border-slate-200 bg-white px-4 py-6 sticky top-[61px] self-start h-[calc(100dvh-61px)] overflow-y-auto shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 px-2 pb-6 mb-4 border-b border-slate-100">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-sm font-semibold text-white shadow-[0_4px_10px_rgba(17,112,214,0.2)]"
          style={{ background: "linear-gradient(135deg, var(--cor-principal), #0e5db6)" }}
        >
          EN
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-bold text-slate-900">
            Área do Engenheiro
          </strong>
          <small className="mt-0.5 block truncate text-xs text-slate-500">
            Fiscalização de obras
          </small>
        </div>
      </div>

      <nav
        aria-label="Menu da área do engenheiro"
        className="flex flex-1 flex-col justify-between"
      >
        <EngenheiroNavLinks user={user} />
      </nav>
    </aside>
  );
}
