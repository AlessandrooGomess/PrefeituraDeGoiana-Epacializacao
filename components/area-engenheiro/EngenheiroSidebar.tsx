import { EngenheiroNavLinks } from "./EngenheiroNavLinks";

// Menu lateral exibido a partir do tablet; no mobile a navegação fica na gaveta do cabeçalho
export function EngenheiroSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-slate-200 bg-white sticky top-14 self-start h-[calc(100dvh-7.5rem)] overflow-y-auto">
      <nav
        aria-label="Menu da área do engenheiro"
        className="flex flex-1 flex-col justify-between p-3"
      >
        <EngenheiroNavLinks />
      </nav>
    </aside>
  );
}
