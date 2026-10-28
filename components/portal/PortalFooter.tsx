export const PORTAL_FOOTER_LINKS = [
  { href: "#privacidade", label: "Privacidade" },
  { href: "#transparencia", label: "Transparência" },
  { href: "#contato", label: "Contato" },
  { href: "#acessibilidade", label: "Acessibilidade" },
];

export function PortalFooter() {
  return (
    <footer className="hidden min-[721px]:block bg-(--cor-header-footer) text-slate-300 py-6 mt-auto">
      <nav
        aria-label="Links institucionais"
        className="w-full px-4 sm:px-7 flex flex-row items-center justify-end gap-8 text-[11px] font-medium"
      >
        {PORTAL_FOOTER_LINKS.map(({ href, label }) => (
          <a key={href} href={href} className="hover:text-white transition">
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
