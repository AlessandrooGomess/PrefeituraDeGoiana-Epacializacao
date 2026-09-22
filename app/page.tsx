"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./portal.module.css";
import type { ObraItem, StatusObra } from "@/types/obra";
import WorkCard from "@/components/map/WorkCard";
import { STATUS_PRESENTATION } from "@/components/map/workPresentation";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[#e8edf7] text-sm text-slate-500">
      Carregando mapa...
    </div>
  ),
});

function distanceInKilometers(
  first: [number, number],
  second: [number, number],
) {
  const earthRadius = 6371;
  const latitudeDelta = ((second[0] - first[0]) * Math.PI) / 180;
  const longitudeDelta = ((second[1] - first[1]) * Math.PI) / 180;
  const latitudeOne = (first[0] * Math.PI) / 180;
  const latitudeTwo = (second[0] * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 * Math.cos(latitudeOne) * Math.cos(latitudeTwo);

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function Home() {
  const [obras, setObras] = useState<ObraItem[]>([]);
  const [query, setQuery] = useState("");
  const [secretarias, setSecretarias] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<StatusObra[]>(["EM_ANDAMENTO"]);
  const [selected, setSelected] = useState<ObraItem | null>(null);
  const [nearMeRequest, setNearMeRequest] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEixoIds, setSelectedEixoIds] = useState<string[]>([]);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const onObrasLoaded = useCallback((items: ObraItem[]) => setObras(items), []);
  const onSelectObra = useCallback((obra: ObraItem) => setSelected(obra), []);

  const secretaries = useMemo(
    () => Array.from(new Map(obras.map((obra) => [obra.secretaria.id, obra.secretaria])).values()),
    [obras],
  );

  const eixos = useMemo(
    () => Array.from(new Map(obras.flatMap((obra) => obra.eixo ? [[obra.eixo.id, obra.eixo]] : [])).values()),
    [obras],
  );

  const areas = useMemo(
    () => selectedEixoIds.length
      ? Array.from(new Map(
          obras
            .filter((obra) => obra.eixo && selectedEixoIds.includes(obra.eixo.id))
            .flatMap((obra) => obra.areaTematica ? [[obra.areaTematica.id, obra.areaTematica]] : []),
        ).values())
      : [],
    [obras, selectedEixoIds],
  );

  const filtered = useMemo(
    () =>
      obras.filter((obra) => {
        const haystack = [obra.titulo, obra.endereco, obra.bairro, obra.secretaria?.nome]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        const searchTerm = query.toLocaleLowerCase("pt-BR");

        return (
          (!(query && !query.trim()) && (!query || haystack.includes(searchTerm))) &&
          (!secretarias.length || secretarias.includes(obra.secretaria.id)) &&
          (!statuses.length || statuses.includes(obra.status)) &&
          (!userLocation || distanceInKilometers(
            userLocation,
            [obra.latitude, obra.longitude],
          ) <= 10) &&
          (!selectedEixoIds.length || (obra.eixo && selectedEixoIds.includes(obra.eixo.id))) &&
          (!selectedAreaIds.length || (obra.areaTematica && selectedAreaIds.includes(obra.areaTematica.id)))
        );
      }),
    [obras, query, secretarias, statuses, selectedEixoIds, selectedAreaIds, userLocation],
  );

  const toggle = <T,>(value: T, values: T[], setter: (next: T[]) => void) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const toggleEixo = (eixoId: string) => {
    const nextEixoIds = selectedEixoIds.includes(eixoId)
      ? selectedEixoIds.filter((id) => id !== eixoId)
      : [...selectedEixoIds, eixoId];
    const availableAreaIds = new Set(
      obras
        .filter((obra) => obra.eixo && nextEixoIds.includes(obra.eixo.id))
        .flatMap((obra) => obra.areaTematica?.id ?? []),
    );

    setSelectedEixoIds(nextEixoIds);
    setSelectedAreaIds((current) => current.filter((areaId) => availableAreaIds.has(areaId)));
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!filtersOpen) return;

    const closeFiltersOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-filter-panel]")) {
        setFiltersOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeFiltersOutside);
    return () => document.removeEventListener("pointerdown", closeFiltersOutside);
  }, [filtersOpen]);

  return (
    <div className={styles["portal-shell"]}>
      <header className={styles["portal-header"]}>
        <div className={styles["portal-logo-slot"]} aria-label="Espaço reservado para a logo da Prefeitura de Goiana" />
        <div className={styles["portal-brand"]}>PORTAL DE INFRAESTRUTURA</div>

        <button
          className={styles["menu-toggle"]}
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Image src="/icons/menu.svg" alt="" width={22} height={19} />
        </button>

        <nav id="main-navigation" className={menuOpen ? styles["is-open"] : ""}>
          <a className={styles.active} href="#mapa" onClick={closeMenu}>Mapa</a>
          <a href="/projetos" onClick={closeMenu}>Projetos</a>
          <a href="/area-do-servidor" onClick={closeMenu}>Área do Servidor</a>
        </nav>

        <div className={styles["portal-tools"]}>
          <label className={styles.search}>
            <Image src="/icons/lupa.svg" alt="" width={16} height={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar projeto..."
              aria-label="Buscar projeto"
            />
          </label>
        </div>
      </header>

      <main id="mapa" className={styles["portal-content"]}>
        <aside
          className={`${styles["filter-panel"]} ${filtersOpen ? styles["is-expanded"] : ""}`}
          data-filter-panel
        >
          <div className={styles["mobile-filter-strip"]}>
            <button
              className={styles["mobile-filter-toggle"]}
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              Filtros
              <span className={styles["filter-toggle-chevron"]} aria-hidden="true">⌄</span>
            </button>
            <button
              className={`${styles["near-button"]} ${styles["near-button-mobile"]}`}
              type="button"
              onClick={() => {
                setNotice(null);
                setNearMeRequest((request) => request + 1);
              }}
            >
              <Image src="/icons/mira-perto-de-mim.svg" alt="" width={18} height={18} />
              Perto de Mim
            </button>
          </div>

          <div className={styles["mobile-category-list"]} aria-label="Eixos estratégicos">
            {eixos.map((eixo) => (
              <button
                className={`${styles["mobile-category-chip"]} ${selectedEixoIds.includes(eixo.id) ? styles["is-selected"] : ""}`}
                key={eixo.id}
                type="button"
                onClick={() => toggleEixo(eixo.id)}
              >
                <span style={{ background: eixo.cor || "#2383d9" }} />
                {eixo.nome}
              </button>
            ))}
          </div>

          <h1>Filtros</h1>

          <button
            className={`${styles["near-button"]} ${styles["near-button-desktop"]}`}
            type="button"
            onClick={() => {
              setNotice(null);
              setNearMeRequest((request) => request + 1);
            }}
          >
            <Image src="/icons/mira-perto-de-mim.svg" alt="" width={18} height={18} />
            Perto de Mim
          </button>

          <section>
            <h2>Eixo Estratégico</h2>
            {eixos.map((eixo) => (
              <label className={styles["check-row"]} key={eixo.id}>
                <input
                  type="checkbox"
                  checked={selectedEixoIds.includes(eixo.id)}
                  onChange={() => toggleEixo(eixo.id)}
                />
                {eixo.nome}
              </label>
            ))}
          </section>

          <section>
            <h2>Áreas Temáticas</h2>
            {areas.map((area) => (
              <label className={styles["check-row"]} key={area.id}>
                <input
                  type="checkbox"
                  checked={selectedAreaIds.includes(area.id)}
                  onChange={() => toggle(area.id, selectedAreaIds, setSelectedAreaIds)}
                />
                {area.nome}
              </label>
            ))}
          </section>

          <section>
            <h2>Categorias</h2>
            {secretaries.map((secretaria) => (
              <label className={styles["check-row"]} key={secretaria.id}>
                <input
                  type="checkbox"
                  checked={secretarias.includes(secretaria.id)}
                  onChange={() => toggle(secretaria.id, secretarias, setSecretarias)}
                />
                <span className="color-dot" style={{ background: secretaria.corIdentificacao || "#2383d9" }} />
                {secretaria.nome.replace("Secretaria de ", "")}
              </label>
            ))}
          </section>

          <section>
            <h2>Status</h2>
            {(Object.keys(STATUS_PRESENTATION) as StatusObra[]).map((status) => (
              <label className={styles["check-row"]} key={status}>
                <input
                  type="checkbox"
                  checked={statuses.includes(status)}
                  onChange={() => toggle(status, statuses, setStatuses)}
                />
                {STATUS_PRESENTATION[status].label}
              </label>
            ))}
          </section>
          {notice && <p className={styles["location-notice"]}>{notice}</p>}

          <button
            className={styles["filter-apply"]}
            type="button"
            onClick={() => setFiltersOpen(false)}
          >
            Filtrar
          </button>
        </aside>

        <div className={styles["map-area"]}>
          <MapContainer
            onObrasLoaded={onObrasLoaded}
            onSelectObra={onSelectObra}
            selectedObraId={selected?.id}
            visibleObraIds={filtered.map((obra) => obra.id)}
            nearMeRequest={nearMeRequest}
            onGeolocationError={setNotice}
            onGeolocationSuccess={(latitude, longitude) => setUserLocation([latitude, longitude])}
          />
          <div className={styles["result-chip"]}>
            {filtered.length} {filtered.length === 1 ? "obra encontrada" : "obras encontradas"}
          </div>
          {selected && <WorkCard obra={selected} onClose={() => setSelected(null)} />}
        </div>
      </main>

      <footer>
        <a href="#privacidade">Privacidade</a>
        <a href="#transparencia">Transparência</a>
        <a href="#contato">Contato</a>
        <a href="#acessibilidade">Acessibilidade</a>
      </footer>
    </div>
  );
}
