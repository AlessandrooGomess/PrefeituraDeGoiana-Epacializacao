"use client";

import { LogOut, MapPinned, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { EngenheiroMenuMobile } from "@/components/area-engenheiro/EngenheiroMenuMobile";

interface RegistroCampoHeaderProps {
  titulo?: string;
  onClose?: () => void;
  // Sem onClose nem backHref, é exibido o botão "Sair" no topo direito
  backHref?: string;
}

export function RegistroCampoHeader({
  titulo = "Novo Registro",
  onClose,
  backHref,
}: RegistroCampoHeaderProps) {
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
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 hover:border-white/50 transition-colors cursor-pointer"
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sair</span>
        </button>
      )}
    </header>
  );
}
