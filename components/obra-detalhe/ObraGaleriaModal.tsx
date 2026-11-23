"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FotoGaleria } from "./ObraGaleria";

interface ObraGaleriaModalProps {
  aberto: boolean;
  fotos: FotoGaleria[];
  onSelecionar: (indice: number) => void;
  onFechar: () => void;
}

// Todas as fotos da obra; escolher uma a coloca em destaque na galeria
export function ObraGaleriaModal({ aberto, fotos, onSelecionar, onFechar }: ObraGaleriaModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // O <dialog> nativo cuida do foco, da tecla Esc e do fundo escurecido
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="galeria-modal-titulo"
      onClose={onFechar}
      // Clique fora do conteúdo (no fundo escurecido) fecha o modal
      onClick={(event) => event.target === event.currentTarget && onFechar()}
      className="m-auto w-[min(56rem,calc(100%-2rem))] max-h-[85vh] rounded-xl p-0 shadow-xl backdrop:bg-slate-900/60"
    >
      <div className="flex max-h-[85vh] flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="galeria-modal-titulo" className="text-base font-bold text-slate-900">
            Fotos da obra ({fotos.length})
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
          {fotos.map((foto, indice) => (
            <li key={foto.id}>
              <button
                type="button"
                onClick={() => onSelecionar(indice)}
                className="group block w-full text-left"
              >
                <span className="relative block aspect-video overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={foto.url}
                    alt={foto.descricao ?? `Foto ${indice + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 300px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </span>
                <span className="mt-1 block text-xs text-slate-500">{foto.tempoDecorrido}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
