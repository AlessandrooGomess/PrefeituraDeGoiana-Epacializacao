import { EngenheiroNavLinks } from "./EngenheiroNavLinks";

// Menu lateral exibido a partir do tablet; no mobile a navegação fica na gaveta do cabeçalho
export function EngenheiroSidebar() {
  return (
    <aside className="hidden md:block w-56 shrink-0 border-r border-slate-200 bg-white">
      <nav aria-label="Menu da área do engenheiro" className="sticky top-14 p-3">
        <EngenheiroNavLinks />
      </nav>
    </aside>
  );
}
