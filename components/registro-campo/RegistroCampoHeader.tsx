"use client";

import { LogOut, MapPinned, Settings, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { EngenheiroMenuMobile } from "@/components/area-engenheiro/EngenheiroMenuMobile";

interface RegistroCampoHeaderProps {
  titulo?: string;
  onClose?: () => void;
  // Sem onClose nem backHref, é exibido o menu de "Configurações" no topo direito
  backHref?: string;
}

export function RegistroCampoHeader({
  titulo = "Novo Registro",
  onClose,
  backHref,
}: RegistroCampoHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        settingsRef.current &&
        event.target instanceof Node &&
        !settingsRef.current.contains(event.target)
      ) {
        setSettingsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-(--cor-header-footer) px-5 py-3.5 text-white shadow-xs">
      <div className="flex items-center gap-3">
        <EngenheiroMenuMobile />
        <div className="flex items-center gap-2.5">
          {/* Marca visual do portal de espacialização de obras */}
          <MapPinned className="h-6 w-6 md:h-7 md:w-7 shrink-0" aria-hidden="true" />
          <h1 className="text-base md:text-lg font-semibold tracking-wide">{titulo}</h1>
        </div>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/90 hover:bg-white/15 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      ) : backHref ? (
        <Link
          href={backHref}
          className="rounded-full p-1 text-white/90 hover:bg-white/15 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Link>
      ) : (
        <div ref={settingsRef} className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            aria-label="Configurações"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            title="Configurações"
            className="inline-flex items-center gap-1.5 rounded-full p-2 text-white/90 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <Settings
              className={`h-5 w-5 transition-transform duration-200 ${
                settingsOpen ? "rotate-45 text-white" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {settingsOpen && (
            <div
              role="menu"
              aria-label="Configurações"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-800 shadow-lg"
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Configurações
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Conta do Engenheiro
                </span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSettingsOpen(false);
                    void signOut({ callbackUrl: "/login" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Sair da conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
