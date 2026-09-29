"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { EngenheiroMenuMobile } from "@/components/area-engenheiro/EngenheiroMenuMobile";

interface RegistroCampoHeaderProps {
  onClose?: () => void;
  backHref?: string;
}

export function RegistroCampoHeader({
  onClose,
  backHref = "/area-do-engenheiro",
}: RegistroCampoHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-blue-600 px-5 py-3.5 text-white shadow-xs">
      <div className="flex items-center gap-3">
        <EngenheiroMenuMobile />
        <h1 className="text-base font-semibold tracking-wide">Novo Registro</h1>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/90 hover:bg-blue-700 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <Link
          href={backHref}
          className="rounded-full p-1 text-white/90 hover:bg-blue-700 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Link>
      )}
    </header>
  );
}