"use client";

import { MapPinned, X } from "lucide-react";
import Link from "next/link";
import { EngenheiroMenuMobile } from "@/components/area-engenheiro/EngenheiroMenuMobile";

interface RegistroCampoHeaderProps {
  titulo?: string;
  onClose?: () => void;
  // Sem onClose nem backHref, o botão "fechar" não é exibido
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
      ) : null}
    </header>
  );
}