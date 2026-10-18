"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, MapPinned, X } from "lucide-react";
import styles from "./prefeito-dashboard.module.css";

interface PrefeitoFiltrosProps {
  secretarias: Array<{ id: string; nome: string; sigla: string }>;
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

  const handleFilterChange = (key: "secretaria" | "eixo", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(filtroSecretaria || filtroEixo);

  return (
    <div className={styles.filterBar} aria-label="Filtros da gestão">
      <div className={styles.filterControls}>
        <div className={styles.filterGroup}>
          <span className={styles.filterIcon}>
            <Filter size={15} aria-hidden="true" />
          </span>
          <label htmlFor="filtro-secretaria" className="sr-only">
            Filtrar por Secretaria
          </label>
          <select
            id="filtro-secretaria"
            className={styles.filterSelect}
            value={filtroSecretaria || ""}
            disabled={isPending}
            onChange={(e) => handleFilterChange("secretaria", e.target.value)}
          >
            <option value="">Todas as Secretarias</option>
            {secretarias.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.sigla} - {sec.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filtro-eixo" className="sr-only">
            Filtrar por Eixo Estratégico
          </label>
          <select
            id="filtro-eixo"
            className={styles.filterSelect}
            value={filtroEixo || ""}
            disabled={isPending}
            onChange={(e) => handleFilterChange("eixo", e.target.value)}
          >
            <option value="">Todos os Eixos</option>
            {eixos.map((eixo) => (
              <option key={eixo.id} value={eixo.id}>
                {eixo.nome}
              </option>
            ))}
          </select>
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
