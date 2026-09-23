"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { EixoComSecretarias, ObraItem } from "@/types/obra";

interface MapContainerProps {
  initialCenter?: [number, number]; // [longitude, latitude]
  initialZoom?: number;
  className?: string;
  onObrasLoaded?: (obras: ObraItem[]) => void;
  onFiltersLoaded?: (eixos: EixoComSecretarias[]) => void;
  onSelectObra?: (obra: ObraItem) => void;
  selectedObraId?: string;
  visibleObraIds?: string[];
  nearMeRequest?: number;
  onGeolocationError?: (message: string) => void;
  onGeolocationSuccess?: (latitude: number, longitude: number) => void;
}

// Coordenadas centrais padrão de Goiana - PE
// Permitem visualizar simultaneamente o centro urbano e os distritos litorâneos (Ponta de Pedras e Carne de Vaca)
const GOIANA_DEFAULT_CENTER: [number, number] = [-34.95, -7.56];
const GOIANA_DEFAULT_ZOOM = 11;

// Extensão real do GeoJSON de Goiana/PE [SW (Sudoeste), NE (Nordeste)]
const GOIANA_BOUNDS: [[number, number], [number, number]] = [
  [-35.077806, -7.714654],
  [-34.806691, -7.462009],
];

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
  onFiltersLoaded,
  onSelectObra,
  selectedObraId,
  visibleObraIds,
  nearMeRequest = 0,
  onGeolocationError,
  onGeolocationSuccess,
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
          goiana: {
            type: "geojson",
            data: "/geojson/goiana-limite.geojson",
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
          {
            id: "goiana-fill",
            type: "fill",
            source: "goiana",
          },
          {
            id: "goiana-line",
            type: "line",
            source: "goiana",
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

    map.once("load", () => {
      map.fitBounds(GOIANA_BOUNDS, { padding: 24, duration: 0 });
      map.resize();
      setTimeout(() => {
        map.resize();
      }, 150);
    });

    mapRef.current = map;
  setMapLoaded(true);

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

  useEffect(() => {
    const container = mapContainerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [mapLoaded]);

  // 2. Busca das Obras via API
  useEffect(() => {
    let isMounted = true;

    async function carregarObras() {
      try {
        setLoading(true);
        setError(null);

        const [obrasResponse, filtersResponse] = await Promise.all([
          fetch("/api/obras"),
          fetch("/api/filtros"),
        ]);
        if (!obrasResponse.ok || !filtersResponse.ok) {
          throw new Error("Falha ao carregar dados do mapa.");
        }

        const [dados, eixos]: [ObraItem[], EixoComSecretarias[]] = await Promise.all([
          obrasResponse.json(),
          filtersResponse.json(),
        ]);
        if (isMounted) {
          setObras(dados);
          onObrasLoaded?.(dados);
          onFiltersLoaded?.(eixos);
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
  }, [onFiltersLoaded, onObrasLoaded]);

  // 3. Renderização dos Marcadores e Popups no Mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Limpar marcadores anteriores com segurança
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    obras.forEach((obra) => {
      if (visibleObraIds && !visibleObraIds.includes(obra.id)) return;

      // Etapa 6: Tratamento rigoroso de coordenadas inválidas
      if (!isValidCoordinate(obra.latitude, obra.longitude)) {
        console.warn(`Obra ignorada por coordenadas inválidas: "${obra.titulo}" (ID: ${obra.id})`);
        return;
      }

      const corSecretaria = obra.secretaria?.corIdentificacao || "#2563EB";

      // Marcador com cor temática da secretaria da obra
      const marker = new maplibregl.Marker({
        color: corSecretaria,
      })
        .setLngLat([obra.longitude, obra.latitude])
        .addTo(map);

      if (obra.id === selectedObraId) {
        marker.getElement().classList.add("map-marker-selected");
      }

      marker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        onSelectObra?.(obra);
      });

      markersRef.current.push(marker);
    });
  }, [obras, mapLoaded, onSelectObra, selectedObraId, visibleObraIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || nearMeRequest === 0) return;

    if (!navigator.geolocation) {
      onGeolocationError?.("Seu navegador não oferece localização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onGeolocationSuccess?.(coords.latitude, coords.longitude);
        map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
      },
      () => onGeolocationError?.("Não foi possível acessar sua localização.")
    );
  }, [mapLoaded, nearMeRequest, onGeolocationError, onGeolocationSuccess]);

  // Contagem de obras válidas
  const obrasValidasCount = obras.filter((o) =>
    isValidCoordinate(o.latitude, o.longitude)
  ).length;

  return (
    <div
      className={`relative w-full h-full flex-1 ${className}`}
      style={{ minHeight: "360px", width: "100%", height: "100%" }}
    >
      {/* Contêiner físico do mapa */}
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0"
        style={{ minHeight: "360px", width: "100%", height: "100%" }}
      />

      {/* Card Flutuante de Informações de Status no Canto Superior Esquerdo */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <div className="text-xs font-medium text-slate-700">
          {loading ? (
            <span>Buscando obras...</span>
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
