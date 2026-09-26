"use client";

import { Camera, MapPin } from "lucide-react";

export interface FotoPreviewItem {
  id: string;
  url: string;
  coordenadas?: string;
}

interface RegistroFotograficoCardProps {
  gpsAtivo?: boolean;
  fotos?: FotoPreviewItem[];
  onAddFoto?: () => void;
}

export function RegistroFotograficoCard({
  gpsAtivo = true,
  fotos = [],
  onAddFoto,
}: RegistroFotograficoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Registro Fotográfico <span className="text-rose-500">*</span>
        </h3>
        {gpsAtivo && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
            <MapPin className="h-3 w-3" />
            GPS Ativo
          </span>
        )}
      </div>

      <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={onAddFoto}
          className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
        >
          <Camera className="h-6 w-6" />
          <span className="text-center text-[11px] font-medium leading-tight">
            Adicionar Foto
          </span>
        </button>

        {fotos.map((foto) => (
          <div
            key={foto.id}
            className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs"
          >
            <img
              src={foto.url}
              alt="Foto da obra"
              className="h-full w-full object-cover"
            />
            {foto.coordenadas && (
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-center text-[9px] font-medium text-white backdrop-blur-xs">
                {foto.coordenadas}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}