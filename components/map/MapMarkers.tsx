import * as maplibregl from "maplibre-gl";
import type { ObraItem } from "@/types/obra";
import { createWorkPopupContent } from "./WorkPopup";

export interface WorkMarker {
  marker: maplibregl.Marker;
  popup: maplibregl.Popup;
  obra: ObraItem;
}

export function isValidWorkCoordinate(obra: ObraItem): boolean {
  return (
    Number.isFinite(obra.latitude) &&
    Number.isFinite(obra.longitude) &&
    obra.latitude >= -90 && obra.latitude <= 90 &&
    obra.longitude >= -180 && obra.longitude <= 180
  );
}

export function clearWorkMarkers(markers: Map<string, WorkMarker>) {
  markers.forEach(({ marker }) => marker.remove());
  markers.clear();
}

interface SyncWorkMarkersOptions {
  map: maplibregl.Map;
  markers: Map<string, WorkMarker>;
  obras: ObraItem[];
  visibleObraIds?: readonly string[];
  selectedObraId?: string | null;
  onSelectObra?: (obra: ObraItem) => void;
}

export function syncWorkMarkers({ map, markers, obras, visibleObraIds, selectedObraId, onSelectObra }: SyncWorkMarkersOptions) {
  clearWorkMarkers(markers);
  const visibleIds = visibleObraIds ? new Set(visibleObraIds) : null;

  obras.forEach((obra) => {
    if (!isValidWorkCoordinate(obra) || (visibleIds && !visibleIds.has(obra.id))) return;

    const element = document.createElement("button");
    element.type = "button";
    element.className = `map-pin ${selectedObraId === obra.id ? "map-pin--selected" : ""}`;
    element.style.setProperty("--pin-color", obra.secretaria.corIdentificacao || "#2383d9");
    element.setAttribute("aria-label", `Ver obra: ${obra.titulo}`);
    element.innerHTML = "<span>⌂</span>";

    const popup = new maplibregl.Popup({
      offset: 24,
      closeButton: false,
      closeOnClick: true,
      maxWidth: "282px",
      className: "obra-maplibre-popup",
    }).setDOMContent(createWorkPopupContent(obra));

    const marker = new maplibregl.Marker({ element, anchor: "bottom" })
      .setLngLat([obra.longitude, obra.latitude])
      .setPopup(popup)
      .addTo(map);

    element.addEventListener("click", () => onSelectObra?.(obra));
    markers.set(obra.id, { marker, popup, obra });
  });
}
