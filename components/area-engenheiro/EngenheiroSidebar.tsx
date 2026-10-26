import { EngenheiroNavLinks } from "./EngenheiroNavLinks";

// Menu lateral exibido a partir do tablet; no mobile a navegação fica na gaveta do cabeçalho
export function EngenheiroSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-slate-200 bg-white">
      <nav
        aria-label="Menu da área do engenheiro"
        className="sticky top-14 flex flex-1 flex-col justify-between p-3 min-h-[calc(100vh-3.5rem)]"
      >
        <EngenheiroNavLinks />
      </nav>
    </aside>
  );
}
