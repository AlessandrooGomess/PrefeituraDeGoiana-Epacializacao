"use client";

import dynamic from "next/dynamic";

// Carregamento dinâmico sem SSR para evitar erros com objetos de navegador (window, document, WebGL)
const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-medium">Carregando mapa de Goiana...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Barra de Cabeçalho Institucional */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 z-10 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🏛️
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Prefeitura Municipal de Goiana
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Plataforma de Espacialização e Transparência de Obras
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● Mapa Ativo
          </span>
        </div>
      </header>

      {/* Área do Mapa */}
      <main className="relative flex-1 w-full h-full">
        <MapContainer />
      </main>
    </div>
  );
}
