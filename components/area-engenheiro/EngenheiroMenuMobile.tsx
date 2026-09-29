"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { EngenheiroNavLinks } from "./EngenheiroNavLinks";

// Mesmo breakpoint "md" do Tailwind a partir do qual o menu lateral assume a navegação
const MEDIA_QUERY_MENU_LATERAL = "(min-width: 768px)";

const SELETOR_FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Botão ☰ + gaveta lateral com a navegação da área do engenheiro (somente mobile)
export function EngenheiroMenuMobile() {
  const [aberto, setAberto] = useState(false);
  const botaoAbrirRef = useRef<HTMLButtonElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const painelId = useId();
  const tituloId = useId();

  const fechar = useCallback(() => setAberto(false), []);

  useEffect(() => {
    if (!aberto) return;

    const botaoAbrir = botaoAbrirRef.current;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botaoFecharRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAberto(false);
        return;
      }

      // Mantém o foco do teclado dentro da gaveta enquanto ela estiver aberta
      if (event.key === "Tab" && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS);
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];

        if (event.shiftKey && document.activeElement === primeiro) {
          event.preventDefault();
          ultimo?.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
          event.preventDefault();
          primeiro?.focus();
        }
      }
    };

    const mediaQuery = window.matchMedia(MEDIA_QUERY_MENU_LATERAL);
    const handleMudancaTela = (event: MediaQueryListEvent) => {
      if (event.matches) setAberto(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleMudancaTela);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleMudancaTela);
      botaoAbrir?.focus();
    };
  }, [aberto]);

  return (
    <>
      <button
        ref={botaoAbrirRef}
        type="button"
        onClick={() => setAberto(true)}
        className="md:hidden -ml-1 rounded-full p-1 text-white/90 hover:bg-blue-700 hover:text-white transition-colors"
        aria-label="Abrir menu"
        aria-expanded={aberto}
        aria-controls={painelId}
      >
        <Menu className="h-5 w-5" />
      </button>

      {aberto &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-slate-900/40" aria-hidden="true" onClick={fechar} />

            <div
              ref={painelRef}
              id={painelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between bg-blue-600 px-4 py-3.5 text-white">
                <h2 id={tituloId} className="text-base font-semibold tracking-wide">
                  Menu
                </h2>
                <button
                  ref={botaoFecharRef}
                  type="button"
                  onClick={fechar}
                  className="rounded-full p-1 text-white/90 hover:bg-blue-700 hover:text-white transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav aria-label="Menu da área do engenheiro" className="flex-1 overflow-y-auto p-3">
                <EngenheiroNavLinks onNavigate={fechar} />
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
