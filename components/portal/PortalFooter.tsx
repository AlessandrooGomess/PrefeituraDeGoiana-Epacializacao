const LINKS = [
  { href: "#privacidade", label: "Privacidade" },
  { href: "#transparencia", label: "Transparência" },
  { href: "#contato", label: "Contato" },
  { href: "#acessibilidade", label: "Acessibilidade" },
];

// Rodapé das páginas públicas do portal
export function PortalFooter() {
  return (
    <footer className="bg-(--cor-header-footer) text-slate-300 py-6 mt-auto">
      <nav
        aria-label="Links institucionais"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-8 text-[11px] font-medium"
      >
        {LINKS.map(({ href, label }) => (
          <a key={href} href={href} className="hover:text-white transition">
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
