"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Filter, MapPinned, X } from "lucide-react";
import styles from "./prefeito-dashboard.module.css";

interface PrefeitoFiltrosProps {
  secretarias: Array<{
    id: string;
    nome: string;
    sigla: string;
    eixoId: string | null;
  }>;
  eixos: Array<{ id: string; nome: string }>;
  filtroSecretaria?: string;
  filtroEixo?: string;
}

export default function PrefeitoFiltros({
  secretarias,
  eixos,
  filtroSecretaria,
  filtroEixo,
}: PrefeitoFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [openMenu, setOpenMenu] = useState<"eixo" | "secretaria" | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const secretariasDisponiveis = filtroEixo
    ? secretarias.filter((sec) => sec.eixoId === filtroEixo)
    : secretarias;

  const eixoAtualLabel =
    eixos.find((eixo) => eixo.id === filtroEixo)?.nome ||
    "Todos os Eixos Temáticos";

  const secretariaPadraoLabel = filtroEixo
    ? "Todas as Secretarias do Eixo"
    : "Todas as Secretarias";

  const secAtual = secretariasDisponiveis.find(
    (sec) => sec.id === filtroSecretaria,
  );
  const secretariaAtualLabel = secAtual
    ? `${secAtual.sigla} - ${secAtual.nome}`
    : secretariaPadraoLabel;

  const handleEixoChange = (novoEixoId: string) => {
    setOpenMenu(null);
    const params = new URLSearchParams(searchParams.toString());
    if (novoEixoId) {
      params.set("eixo", novoEixoId);
    } else {
      params.delete("eixo");
    }
    // Ao trocar de eixo, limpa a secretaria para evitar combinação incompatível
    params.delete("secretaria");

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const handleSecretariaChange = (novaSecretariaId: string) => {
    setOpenMenu(null);
    const params = new URLSearchParams(searchParams.toString());
    if (novaSecretariaId) {
      params.set("secretaria", novaSecretariaId);
      const secObj = secretarias.find((s) => s.id === novaSecretariaId);
      if (secObj?.eixoId && !params.get("eixo")) {
        params.set("eixo", secObj.eixoId);
      }
    } else {
      params.delete("secretaria");
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const handleClear = () => {
    setOpenMenu(null);
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(filtroSecretaria || filtroEixo);

  return (
    <div className={styles.filterBar} aria-label="Filtros da gestão">
      <div className={styles.filterControls} ref={controlsRef}>
        <div className={styles.filterGroup}>
          <span className={styles.filterIcon}>
            <Filter size={15} aria-hidden="true" />
          </span>
          <label htmlFor="filtro-eixo" className="sr-only">
            Filtrar por Eixo Estratégico
          </label>
          <select
            id="filtro-eixo"
            className={`${styles.filterSelect} ${styles.desktopSelect}`}
            value={filtroEixo || ""}
            disabled={isPending}
            onChange={(e) => handleEixoChange(e.target.value)}
          >
            <option value="">Todos os Eixos Temáticos</option>
            {eixos.map((eixo) => (
              <option key={eixo.id} value={eixo.id}>
                {eixo.nome}
              </option>
            ))}
          </select>

          <div className={styles.mobileDropdown}>
            <button
              type="button"
              className={styles.mobileDropdownTrigger}
              disabled={isPending}
              aria-expanded={openMenu === "eixo"}
              onClick={() =>
                setOpenMenu((prev) => (prev === "eixo" ? null : "eixo"))
              }
            >
              <span className={styles.mobileDropdownTriggerContent}>
                <Filter size={14} className={styles.mobileTriggerIcon} aria-hidden="true" />
                <span className={styles.mobileDropdownLabel}>{eixoAtualLabel}</span>
              </span>
              <ChevronDown
                size={15}
                className={`${styles.mobileDropdownChevron} ${
                  openMenu === "eixo" ? styles.mobileDropdownChevronOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openMenu === "eixo" && (
              <ul className={styles.mobileDropdownMenu} role="listbox">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!filtroEixo}
                    className={`${styles.mobileDropdownOption} ${
                      !filtroEixo ? styles.mobileDropdownOptionActive : ""
                    }`}
                    onClick={() => handleEixoChange("")}
                  >
                    Todos os Eixos Temáticos
                  </button>
                </li>
                {eixos.map((eixo) => (
                  <li key={eixo.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={filtroEixo === eixo.id}
                      className={`${styles.mobileDropdownOption} ${
                        filtroEixo === eixo.id
                          ? styles.mobileDropdownOptionActive
                          : ""
                      }`}
                      onClick={() => handleEixoChange(eixo.id)}
                    >
                      {eixo.nome}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filtro-secretaria" className="sr-only">
            Filtrar por Secretaria
          </label>
          <select
            id="filtro-secretaria"
            className={`${styles.filterSelect} ${styles.desktopSelect}`}
            value={filtroSecretaria || ""}
            disabled={isPending}
            onChange={(e) => handleSecretariaChange(e.target.value)}
          >
            <option value="">{secretariaPadraoLabel}</option>
            {secretariasDisponiveis.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.sigla} - {sec.nome}
              </option>
            ))}
          </select>

          <div className={styles.mobileDropdown}>
            <button
              type="button"
              className={styles.mobileDropdownTrigger}
              disabled={isPending}
              aria-expanded={openMenu === "secretaria"}
              onClick={() =>
                setOpenMenu((prev) =>
                  prev === "secretaria" ? null : "secretaria",
                )
              }
            >
              <span className={styles.mobileDropdownLabel}>
                {secretariaAtualLabel}
              </span>
              <ChevronDown
                size={15}
                className={`${styles.mobileDropdownChevron} ${
                  openMenu === "secretaria"
                    ? styles.mobileDropdownChevronOpen
                    : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openMenu === "secretaria" && (
              <ul className={styles.mobileDropdownMenu} role="listbox">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!filtroSecretaria}
                    className={`${styles.mobileDropdownOption} ${
                      !filtroSecretaria ? styles.mobileDropdownOptionActive : ""
                    }`}
                    onClick={() => handleSecretariaChange("")}
                  >
                    {secretariaPadraoLabel}
                  </button>
                </li>
                {secretariasDisponiveis.map((sec) => (
                  <li key={sec.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={filtroSecretaria === sec.id}
                      className={`${styles.mobileDropdownOption} ${
                        filtroSecretaria === sec.id
                          ? styles.mobileDropdownOptionActive
                          : ""
                      }`}
                      onClick={() => handleSecretariaChange(sec.id)}
                    >
                      <strong>{sec.sigla}</strong> - {sec.nome}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearFilterButton}
            disabled={isPending}
          >
            <X size={13} aria-hidden="true" />
            Limpar filtros
          </button>
        )}

        {isPending && <span className={styles.filterLoading}>Filtrando...</span>}
      </div>

      <div className={styles.filterActions}>
        <Link href="/" className={styles.mapShortcutButton}>
          <MapPinned size={14} aria-hidden="true" />
          Ver no Mapa
        </Link>
      </div>
    </div>
  );
}
