"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import type { ObraItem, StatusObra } from "@/types/obra";
import WorkCard from "@/components/map/WorkCard";
import { STATUS_PRESENTATION } from "@/components/map/workPresentation";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), { ssr: false, loading: () => <div className="grid h-full place-items-center bg-[#e8edf7] text-sm text-slate-500">Carregando mapa...</div> });
function Icon({ children }: { children: React.ReactNode }) { return <span aria-hidden="true" className="inline-flex leading-none">{children}</span>; }

export default function Home() {
  const [obras, setObras] = useState<ObraItem[]>([]); const [query, setQuery] = useState(""); const [secretarias, setSecretarias] = useState<string[]>([]); const [statuses, setStatuses] = useState<StatusObra[]>(["EM_ANDAMENTO"]); const [selected, setSelected] = useState<ObraItem | null>(null); const [nearMeRequest, setNearMeRequest] = useState(0); const [notice, setNotice] = useState<string | null>(null);
  const onObrasLoaded = useCallback((items: ObraItem[]) => setObras(items), []); const onSelectObra = useCallback((obra: ObraItem) => setSelected(obra), []);
  const secretaries = useMemo(() => Array.from(new Map(obras.map((obra) => [obra.secretaria.id, obra.secretaria])).values()), [obras]);
  const filtered = useMemo(() => obras.filter((obra) => { const haystack = [obra.titulo, obra.endereco, obra.bairro, obra.secretaria?.nome].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR"); return (!query || haystack.includes(query.toLocaleLowerCase("pt-BR"))) && (!secretarias.length || secretarias.includes(obra.secretaria.id)) && (!statuses.length || statuses.includes(obra.status)); }), [obras, query, secretarias, statuses]);
  const toggle = <T,>(value: T, values: T[], setter: (next: T[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  return <div className="portal-shell"><header className="portal-header"><div className="portal-brand">PORTAL DE INFRAESTRUTURA</div><nav><a className="active" href="#mapa">Mapa</a><a href="#projetos">Projetos</a></nav><div className="portal-tools"><label className="search"><Icon>⌕</Icon><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar projeto..." aria-label="Buscar projeto" /></label><button aria-label="Notificações">♧</button><button aria-label="Perfil">◎</button></div></header>
    <main id="mapa" className="portal-content"><aside className="filter-panel"><h1>Filtros</h1><button className="near-button" onClick={() => { setNotice(null); setNearMeRequest((n) => n + 1); }}><Icon>⌾</Icon> Perto de Mim</button><section><h2>Categorias</h2>{secretaries.map((secretaria) => <label className="check-row" key={secretaria.id}><input type="checkbox" checked={secretarias.includes(secretaria.id)} onChange={() => toggle(secretaria.id, secretarias, setSecretarias)} /><span className="color-dot" style={{ background: secretaria.corIdentificacao || "#2383d9" }} />{secretaria.nome.replace("Secretaria de ", "")}</label>)}</section><section><h2>Status</h2>{(Object.keys(STATUS_PRESENTATION) as StatusObra[]).map((status) => <label className="check-row" key={status}><input type="checkbox" checked={statuses.includes(status)} onChange={() => toggle(status, statuses, setStatuses)} />{STATUS_PRESENTATION[status].label}</label>)}</section>{notice && <p className="location-notice">{notice}</p>}</aside>
      <div className="map-area"><MapContainer onObrasLoaded={onObrasLoaded} onSelectObra={onSelectObra} selectedObraId={selected?.id} visibleObraIds={filtered.map((obra) => obra.id)} nearMeRequest={nearMeRequest} onGeolocationError={setNotice} /><div className="result-chip">{filtered.length} {filtered.length === 1 ? "obra encontrada" : "obras encontradas"}</div>{selected && <WorkCard obra={selected} onClose={() => setSelected(null)} />}</div></main>
    <footer><a href="#privacidade">Privacidade</a><a href="#transparencia">Transparência</a><a href="#contato">Contato</a><a href="#acessibilidade">Acessibilidade</a></footer></div>;
}
