"use client";

import { useState } from "react";
import { Wrench, ChevronDown, Check } from "lucide-react";

export interface ObraItemResumo {
  id: string;
  titulo: string;
  numeroOrdemServico?: string | null;
  bairro?: string | null;
  empresaContratada?: string | null;
  status?: string;
}

interface ObraInfoCardProps {
  obras?: ObraItemResumo[];
  selectedObraId?: string;
  onSelectObra?: (obraId: string) => void;
  tituloFallback?: string;
  subtituloFallback?: string;
}

export function ObraInfoCard({
  obras = [],
  selectedObraId,
  onSelectObra,
  tituloFallback = "Escola Municipal Centro",
  subtituloFallback = "Lote 03 - Fase de Estrutura",
}: ObraInfoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const obraAtual = obras.find((o) => o.id === selectedObraId) ?? obras[0];

  const titulo = obraAtual?.titulo ?? tituloFallback;
  const subtitulo = obraAtual
    ? [obraAtual.numeroOrdemServico, obraAtual.bairro]
        .filter(Boolean)
        .join(" • ") || obraAtual.empresaContratada || "Fase de Execução"
    : subtituloFallback;

  const temMaisDeUma = obras.length > 1;

  return (
    <div className="relative">
      <div
        role={temMaisDeUma ? "button" : undefined}
        tabIndex={temMaisDeUma ? 0 : undefined}
        onClick={() => temMaisDeUma && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (temMaisDeUma && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-colors ${
          temMaisDeUma
            ? "cursor-pointer hover:border-blue-400 hover:bg-slate-50/50"
            : ""
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          <Wrench className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3
              className="truncate text-sm font-bold text-slate-800"
              title={titulo}
            >
              {titulo}
            </h3>
          </div>
          <p className="truncate text-xs text-slate-500">{subtitulo}</p>
        </div>

        {temMaisDeUma && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:text-slate-600">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        )}
      </div>

      {isOpen && temMaisDeUma && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Selecione a Obra para Vistoria
            </div>
            {obras.map((obra) => {
              const isSelected = obraAtual?.id === obra.id;
              return (
                <button
                  key={obra.id}
                  type="button"
                  onClick={() => {
                    onSelectObra?.(obra.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate">{obra.titulo}</p>
                    <p className="truncate text-[10px] text-slate-400">
                      {[obra.numeroOrdemServico, obra.bairro]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}