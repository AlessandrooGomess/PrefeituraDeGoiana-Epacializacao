"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ObraItem } from "@/types/obra";

interface MapContainerProps {
  initialCenter?: [number, number]; // [longitude, latitude]
  initialZoom?: number;
  className?: string;
  onObrasLoaded?: (obras: ObraItem[]) => void;
}

// Coordenadas centrais padrão de Goiana - PE
// Permitem visualizar simultaneamente o centro urbano e os distritos litorâneos (Ponta de Pedras e Carne de Vaca)
const GOIANA_DEFAULT_CENTER: [number, number] = [-34.95, -7.56];
const GOIANA_DEFAULT_ZOOM = 11;

// Delimitação territorial de Goiana/PE [SW (Sudoeste), NE (Nordeste)]
// Garante que o mapa fique restrito à extensão geográfica do município
const GOIANA_BOUNDS: [[number, number], [number, number]] = [
  [-35.20, -7.75], // Sudoeste
  [-34.75, -7.40], // Nordeste
];

// Sanitização contra XSS para injeção segura no Popup do MapLibre
function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Formatadores seguros
function formatarMoeda(valor: number | null): string | null {
  if (valor === null || valor === undefined) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(dataIso: string | null): string | null {
  if (!dataIso) return null;
  try {
    const data = new Date(dataIso);
    return isNaN(data.getTime())
      ? null
      : data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return null;
  }
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PLANEJADA: { label: "Planejada", bg: "#F1F5F9", text: "#475569" },
  ORDEM_EMITIDA: { label: "Ordem Emitida", bg: "#E0F2FE", text: "#0369A1" },
  EM_ANDAMENTO: { label: "Em Andamento", bg: "#FEF3C7", text: "#B45309" },
  PARALISADA: { label: "Paralisada", bg: "#FEE2E2", text: "#B91C1C" },
  CONCLUIDA: { label: "Concluída", bg: "#DCFCE7", text: "#15803D" },
};

// Validador estrito de coordenadas geográficas válidas
function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export default function MapContainer({
  initialCenter = GOIANA_DEFAULT_CENTER,
  initialZoom = GOIANA_DEFAULT_ZOOM,
  className = "w-full h-full min-h-[500px]",
  onObrasLoaded,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [obras, setObras] = useState<ObraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // 1. Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inicialização da instância MapLibre GL
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: GOIANA_BOUNDS,
    });

    // Adiciona controles de zoom e rotação (canto superior direito)
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    // Cleanup seguro para evitar vazamento de memória e duplicações no React 19
    return () => {
      // Limpeza de marcadores e instância do mapa
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [initialCenter, initialZoom]);

  // 2. Busca das Obras via API
  useEffect(() => {
    let isMounted = true;

    async function carregarObras() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/obras");
        if (!response.ok) {
          throw new Error(`Falha ao carregar obras (status: ${response.status})`);
        }

        const dados: ObraItem[] = await response.json();
        if (isMounted) {
          setObras(dados);
          onObrasLoaded?.(dados);
        }
      } catch (err) {
        console.error("Erro na busca de obras:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Erro desconhecido ao carregar obras."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    carregarObras();

    return () => {
      isMounted = false;
    };
  }, [onObrasLoaded]);

  // 3. Renderização dos Marcadores e Popups no Mapa
  const renderizarMarcadores = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Limpar marcadores anteriores com segurança
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    obras.forEach((obra) => {
      // Etapa 6: Tratamento rigoroso de coordenadas inválidas
      if (!isValidCoordinate(obra.latitude, obra.longitude)) {
        console.warn(`Obra ignorada por coordenadas inválidas: "${obra.titulo}" (ID: ${obra.id})`);
        return;
      }

      const status = STATUS_CONFIG[obra.status] || {
        label: obra.status,
        bg: "#F1F5F9",
        text: "#475569",
      };

      const valorFormatado = formatarMoeda(obra.valorContrato);
      const previsaoFormatada = formatarData(obra.previsaoConclusao);
      const corSecretaria = obra.secretaria?.corIdentificacao || "#2563EB";

      // HTML estruturado e seguro para o Popup
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 240px; max-width: 300px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: ${status.bg}; color: ${status.text};">
              ${escapeHtml(status.label)}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${corSecretaria};">
              ${escapeHtml(obra.secretaria?.sigla || "")}
            </span>
          </div>

          <h3 style="font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 6px 0; line-height: 1.35;">
            🏗️ ${escapeHtml(obra.titulo)}
          </h3>

          ${
            obra.descricao
              ? `<p style="font-size: 11px; color: #475569; margin: 0 0 8px 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(obra.descricao)}</p>`
              : ""
          }

          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px; font-size: 11px; color: #334155; display: flex; flex-direction: column; gap: 3px;">
            <div><strong>📍 Endereço:</strong> ${escapeHtml(obra.endereco)}</div>
            <div><strong>🏘️ Bairro:</strong> ${escapeHtml(obra.bairro)}</div>
            ${
              obra.percentualExecutado !== null
                ? `<div><strong>📊 Execução:</strong> ${obra.percentualExecutado.toFixed(1)}%</div>`
                : ""
            }
            ${
              previsaoFormatada
                ? `<div><strong>📅 Previsão:</strong> ${previsaoFormatada}</div>`
                : ""
            }
            ${
              valorFormatado
                ? `<div><strong>💰 Contrato:</strong> ${valorFormatado}</div>`
                : ""
            }
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "320px",
      }).setHTML(popupContent);

      // Marcador com cor temática da secretaria da obra
      const marker = new maplibregl.Marker({
        color: corSecretaria,
      })
        .setLngLat([obra.longitude, obra.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [obras, mapLoaded]);

  useEffect(() => {
    renderizarMarcadores();
  }, [renderizarMarcadores]);

  // Contagem de obras válidas
  const obrasValidasCount = obras.filter((o) =>
    isValidCoordinate(o.latitude, o.longitude)
  ).length;

  return (
    <div className={`relative ${className}`}>
      {/* Contêiner físico do mapa */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

      {/* Card Flutuante de Informações de Status no Canto Superior Esquerdo */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <div className="text-xs font-medium text-slate-700">
          {loading ? (
            <span>Buscando obras no banco...</span>
          ) : error ? (
            <span className="text-rose-600 font-semibold">Falha ao obter obras</span>
          ) : (
            <span>
              <strong className="text-slate-900 font-bold">{obrasValidasCount}</strong>{" "}
              obras georreferenciadas
            </span>
          )}
        </div>
      </div>

      {/* Alerta de Erro caso a API falhe */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-10 bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-lg shadow-md max-w-md">
          <p className="font-semibold">Erro ao carregar dados:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
