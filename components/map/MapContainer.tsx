"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ObraItem } from "@/types/obra";

interface MapContainerProps {
  className?: string;
  onObrasLoaded?: (obras: ObraItem[]) => void;
  visibleObraIds?: string[];
  selectedObraId?: string | null;
  onSelectObra?: (obra: ObraItem) => void;
  nearMeRequest?: number;
  onGeolocationError?: (message: string) => void;
}

const GOIANA_BOUNDS: [[number, number], [number, number]] = [[-35.077806, -7.714654], [-34.806691, -7.462009]];
const statusLabel: Record<string, string> = { PLANEJADA: "Em planejamento", ORDEM_EMITIDA: "Ordem emitida", EM_ANDAMENTO: "Em execução", PARALISADA: "Paralisada", CONCLUIDA: "Concluída" };

function validCoordinate(lat: unknown, lng: unknown): lat is number { return typeof lat === "number" && typeof lng === "number" && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180; }
function popupHtml(obra: ObraItem) {
  const previsao = obra.previsaoConclusao ? new Date(obra.previsaoConclusao).toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" }) : null;
  const percentual = obra.percentualExecutado ?? 0;
  return `<div class="obra-popup"><span class="obra-popup__tag">${obra.secretaria?.sigla || "OBRA"}</span><h3>${obra.titulo}</h3><div class="obra-popup__meta"><span>● ${statusLabel[obra.status] || obra.status}</span>${previsao ? `<span>▣ Previsão: ${previsao}</span>` : ""}</div><div class="obra-popup__progress"><span style="width:${Math.max(0, Math.min(100, percentual))}%"></span></div></div>`;
}

export default function MapContainer({ className = "h-full w-full", onObrasLoaded, visibleObraIds, selectedObraId, onSelectObra, nearMeRequest, onGeolocationError }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerMapRef = useRef(new Map<string, { marker: maplibregl.Marker; popup: maplibregl.Popup; obra: ObraItem }>());
  const [obras, setObras] = useState<ObraItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const markerMap = markerMapRef.current;
    try {
      const map = new maplibregl.Map({ container: mapContainerRef.current, style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap contributors" }, goiana: { type: "geojson", data: "/geojson/goiana-limite.geojson" } }, layers: [{ id: "osm-layer", type: "raster", source: "osm", minzoom: 0, maxzoom: 19 }, { id: "goiana-fill", type: "fill", source: "goiana", paint: { "fill-color": "#dbeafe", "fill-opacity": 0.10 } }, { id: "goiana-line", type: "line", source: "goiana", paint: { "line-color": "#5c7b9b", "line-width": 1.5, "line-opacity": 0.55 } }] }, center: [-34.95, -7.56], zoom: 11, minZoom: 10, maxZoom: 18, maxBounds: GOIANA_BOUNDS });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.once("load", () => { map.fitBounds(GOIANA_BOUNDS, { padding: 24, duration: 0 }); map.resize(); });
      map.on("error", (event) => { if (event.error) console.error("Erro do MapLibre:", event.error); });
      mapRef.current = map;
      const readyTimer = window.setTimeout(() => setReady(true), 0);
      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(mapContainerRef.current);
      const resizeTimer = window.setTimeout(() => map.resize(), 150);
      return () => { window.clearTimeout(readyTimer); window.clearTimeout(resizeTimer); resizeObserver.disconnect(); markerMap.forEach(({ marker }) => marker.remove()); markerMap.clear(); map.remove(); mapRef.current = null; };
    } catch (mapError) {
      const message = mapError instanceof Error ? `Não foi possível iniciar o mapa: ${mapError.message}` : "Não foi possível iniciar o mapa.";
      window.setTimeout(() => setError(message), 0);
    }
  }, []);

  useEffect(() => { let active = true; fetch("/api/obras").then(async (response) => { if (!response.ok) throw new Error("Não foi possível carregar as obras."); return response.json() as Promise<ObraItem[]>; }).then((items) => { if (active) { setObras(items); onObrasLoaded?.(items); } }).catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Erro ao carregar obras."); }); return () => { active = false; }; }, [onObrasLoaded]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    markerMapRef.current.forEach(({ marker }) => marker.remove()); markerMapRef.current.clear(); const allowed = visibleObraIds ? new Set(visibleObraIds) : null;
    obras.forEach((obra) => {
      if (!validCoordinate(obra.latitude, obra.longitude) || (allowed && !allowed.has(obra.id))) return;
      const pin = document.createElement("button"); pin.type = "button"; pin.className = `map-pin ${selectedObraId === obra.id ? "map-pin--selected" : ""}`; pin.style.setProperty("--pin-color", obra.secretaria?.corIdentificacao || "#2383d9"); pin.setAttribute("aria-label", `Ver obra: ${obra.titulo}`); pin.innerHTML = "<span>⌂</span>";
      const popup = new maplibregl.Popup({ offset: 24, closeButton: false, closeOnClick: true, maxWidth: "282px", className: "obra-maplibre-popup" }).setHTML(popupHtml(obra));
      const marker = new maplibregl.Marker({ element: pin, anchor: "bottom" }).setLngLat([obra.longitude, obra.latitude]).setPopup(popup).addTo(mapRef.current!);
      pin.addEventListener("click", () => onSelectObra?.(obra)); markerMapRef.current.set(obra.id, { marker, popup, obra });
    });
  }, [obras, ready, visibleObraIds, selectedObraId, onSelectObra]);

  useEffect(() => { if (!selectedObraId) return; const current = markerMapRef.current.get(selectedObraId); if (!current || !mapRef.current) return; mapRef.current.flyTo({ center: [current.obra.longitude, current.obra.latitude], zoom: Math.max(mapRef.current.getZoom(), 14), essential: true }); current.popup.addTo(mapRef.current); }, [selectedObraId]);
  useEffect(() => { if (!nearMeRequest || !mapRef.current) return; if (!navigator.geolocation) { onGeolocationError?.("Seu navegador não oferece suporte à geolocalização."); return; } navigator.geolocation.getCurrentPosition(({ coords }) => mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 15, essential: true }), () => onGeolocationError?.("Não foi possível acessar sua localização. Verifique a permissão do navegador."), { enableHighAccuracy: true, timeout: 10000 }); }, [nearMeRequest, onGeolocationError]);
  return <div className={`relative ${className}`}><div ref={mapContainerRef} className="h-full w-full absolute inset-0" />{error && <div className="absolute bottom-5 left-5 z-10 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 shadow">{error}</div>}</div>;
}
