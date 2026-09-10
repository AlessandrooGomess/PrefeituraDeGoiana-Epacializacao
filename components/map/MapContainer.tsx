"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ObraItem } from "@/types/obra";
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import { clearWorkMarkers, syncWorkMarkers, type WorkMarker } from "./MapMarkers";

interface MapContainerProps {
  className?: string;
  onObrasLoaded?: (obras: ObraItem[]) => void;
  visibleObraIds?: string[];
  selectedObraId?: string | null;
  onSelectObra?: (obra: ObraItem) => void;
  nearMeRequest?: number;
  onGeolocationError?: (message: string) => void;
}

const GOIANA_BOUNDS: [[number, number], [number, number]] = [
  [-35.077806, -7.714654],
  [-34.806691, -7.462009],
];

const MAP_STYLE: maplibregl.StyleSpecification = {
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
      attribution: "© OpenStreetMap contributors",
    },
    goiana: { type: "geojson", data: "/geojson/goiana-limite.geojson" },
  },
  layers: [
    { id: "osm-layer", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 },
    { id: "goiana-fill", type: "fill", source: "goiana", paint: { "fill-color": "#dbeafe", "fill-opacity": 0.1 } },
    { id: "goiana-line", type: "line", source: "goiana", paint: { "line-color": "#5c7b9b", "line-width": 1.5, "line-opacity": 0.55 } },
  ],
};

export default function MapContainer({ className = "h-full w-full", onObrasLoaded, visibleObraIds, selectedObraId, onSelectObra, nearMeRequest, onGeolocationError }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, WorkMarker>());
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [obras, setObras] = useState<ObraItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Criação e descarte da instância; o ResizeObserver evita canvas com dimensões iniciais incorretas.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const markers = markersRef.current;

    try {
      const instance = new maplibregl.Map({
        container,
        style: MAP_STYLE,
        center: [-34.95, -7.56],
        zoom: 11,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: GOIANA_BOUNDS,
      });
      mapRef.current = instance;
      const readyTimer = window.setTimeout(() => {
        if (mapRef.current !== instance) return;
        setMap(instance);
        setIsMapReady(true);
      }, 0);

      let mapReady = false;
      const handleLoad = () => {
        if (mapReady || mapRef.current !== instance) return;
        mapReady = true;
        instance.fitBounds(GOIANA_BOUNDS, { padding: 24, duration: 0 });
        instance.resize();
        setMap(instance);
        setIsMapReady(true);
      };
      instance.once("load", handleLoad);
      instance.once("idle", handleLoad);

      const resizeObserver = new ResizeObserver(() => instance.resize());
      resizeObserver.observe(container);

      return () => {
        window.clearTimeout(readyTimer);
        resizeObserver.disconnect();
        clearWorkMarkers(markers);
        instance.remove();
        if (mapRef.current === instance) {
          mapRef.current = null;
          setMap(null);
          setIsMapReady(false);
        }
      };
    } catch (mapError) {
      const message = mapError instanceof Error ? `Não foi possível iniciar o mapa: ${mapError.message}` : "Não foi possível iniciar o mapa.";
      window.setTimeout(() => setError(message), 0);
    }
  }, []);

  // A API permanece a fonte única de dados das obras.
  useEffect(() => {
    let active = true;
    fetch("/api/obras")
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar as obras.");
        return response.json() as Promise<ObraItem[]>;
      })
      .then((items) => {
        if (!active) return;
        setObras(items);
        onObrasLoaded?.(items);
      })
      .catch((fetchError: unknown) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : "Erro ao carregar obras.");
      });

    return () => { active = false; };
  }, [onObrasLoaded]);

  // Sincroniza marcadores sempre que obras, filtros visíveis ou seleção forem alterados.
  useEffect(() => {
    if (!map || !isMapReady) return;
    syncWorkMarkers({ map, markers: markersRef.current, obras, visibleObraIds, selectedObraId, onSelectObra });
  }, [map, obras, isMapReady, visibleObraIds, selectedObraId, onSelectObra]);

  // Seleção externa (por card/lista) centraliza o mapa e abre o popup correspondente.
  useEffect(() => {
    if (!selectedObraId || !map) return;
    const workMarker = markersRef.current.get(selectedObraId);
    if (!workMarker) return;
    map.flyTo({ center: [workMarker.obra.longitude, workMarker.obra.latitude], zoom: Math.max(map.getZoom(), 14), essential: true });
    workMarker.popup.addTo(map);
  }, [map, selectedObraId]);

  // A solicitação é controlada pelo botão visual da tela, sem estado de geolocalização duplicado.
  useEffect(() => {
    if (!nearMeRequest || !map) return;
    if (!navigator.geolocation) {
      onGeolocationError?.("Seu navegador não oferece suporte à geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15, essential: true }),
      () => onGeolocationError?.("Não foi possível acessar sua localização. Verifique a permissão do navegador."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [map, nearMeRequest, onGeolocationError]);

  return <div className={`relative ${className}`}><div ref={containerRef} className="absolute inset-0 h-full w-full" /><MapControls map={map} /><MapLegend />{error && <div className="absolute bottom-5 left-5 z-10 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 shadow">{error}</div>}</div>;
}
