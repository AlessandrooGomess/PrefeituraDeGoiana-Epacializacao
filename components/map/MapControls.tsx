"use client";

import { useEffect } from "react";
import type { Map } from "maplibre-gl";
import * as maplibregl from "maplibre-gl";

interface MapControlsProps {
  map: Map | null;
}

/** Instala os controles nativos do MapLibre sem misturar essa preocupação ao contêiner. */
export default function MapControls({ map }: MapControlsProps) {
  useEffect(() => {
    if (!map) return;

    const navigationControl = new maplibregl.NavigationControl({ showCompass: false });
    map.addControl(navigationControl, "top-right");

    return () => {
      map.removeControl(navigationControl);
    };
  }, [map]);

  return null;
}
