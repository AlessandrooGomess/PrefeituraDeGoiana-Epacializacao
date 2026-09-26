"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, MapPin, X, Loader2 } from "lucide-react";

export interface FotoItem {
  id: string;
  url: string;
  file?: File;
  latitude?: number | null;
  longitude?: number | null;
  coordenadasFormatadas?: string;
  descricao?: string;
}

interface RegistroFotograficoCardProps {
  fotos?: FotoItem[];
  onChangeFotos?: (fotos: FotoItem[]) => void;
  erro?: string | null;
}

export function RegistroFotograficoCard({
  fotos = [],
  onChangeFotos,
  erro,
}: RegistroFotograficoCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"ativo" | "buscando" | "inativo">("buscando");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 1. Tenta obter o GPS real do dispositivo
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("inativo");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: Number(position.coords.latitude.toFixed(4)),
          lng: Number(position.coords.longitude.toFixed(4)),
        });
        setGpsStatus("ativo");
      },
      () => {
        // Se o usuário negar permissão ou falhar, fallback gracioso
        setGpsStatus("inativo");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // 2. Manipula a seleção/captura de novas fotos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novasFotos: FotoItem[] = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      const lat = gpsCoords?.lat ?? null;
      const lng = gpsCoords?.lng ?? null;
      const formatado = lat && lng ? `${lat}, ${lng}` : undefined;

      return {
        id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url,
        file,
        latitude: lat,
        longitude: lng,
        coordenadasFormatadas: formatado,
      };
    });

    onChangeFotos?.([...fotos, ...novasFotos]);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente se quiser
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 3. Remove uma foto da lista
  const handleRemoveFoto = (id: string) => {
    const filtradas = fotos.filter((f) => f.id !== id);
    onChangeFotos?.(filtradas);
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-xs transition-colors ${
        erro ? "border-rose-400 bg-rose-50/20" : "border-slate-200"
      }`}
    >
      {/* Input oculto para acionar a câmera ou seletor de arquivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">
          Registro Fotográfico <span className="text-rose-500">*</span>
        </h3>

        {/* Indicador de Status do GPS */}
        {gpsStatus === "ativo" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <MapPin className="h-3 w-3" />
            GPS Ativo
          </span>
        )}

        {gpsStatus === "buscando" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Obtendo GPS...
          </span>
        )}

        {gpsStatus === "inativo" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <MapPin className="h-3 w-3" />
            GPS Indisponível
          </span>
        )}
      </div>

      {erro && (
        <p className="mt-1 text-[11px] font-medium text-rose-600">{erro}</p>
      )}

      {/* Carrossel horizontal de fotos */}
      <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1">
        {/* Botão de Adicionar Foto */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
        >
          <Camera className="h-6 w-6" />
          <span className="text-center text-[11px] font-medium leading-tight">
            Adicionar Foto
          </span>
        </button>

        {/* Miniaturas das fotos adicionadas */}
        {fotos.map((foto) => (
          <div
            key={foto.id}
            className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs"
          >
            <img
              src={foto.url}
              alt="Foto da vistoria"
              className="h-full w-full object-cover"
            />

            {/* Botão de Excluir Foto */}
            <button
              type="button"
              onClick={() => handleRemoveFoto(foto.id)}
              className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
              title="Remover foto"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Carimbo de Coordenadas do GPS */}
            {foto.coordenadasFormatadas && (
              <div className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-0.5 text-center text-[9px] font-medium text-white backdrop-blur-xs truncate">
                {foto.coordenadasFormatadas}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}