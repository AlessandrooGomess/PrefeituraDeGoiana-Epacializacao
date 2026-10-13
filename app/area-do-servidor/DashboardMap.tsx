"use client";

import dynamic from "next/dynamic";
import styles from "./prefeito-dashboard.module.css";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Carregando mapa...</div>,
});

export default function DashboardMap() {
  return <MapContainer className={styles.mapSurface} initialZoom={10.5} />;
}