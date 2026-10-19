"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, MapPinned, X } from "lucide-react";
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

  const secretariasDisponiveis = filtroEixo
    ? secretarias.filter((sec) => sec.eixoId === filtroEixo)
    : secretarias;

  const handleEixoChange = (novoEixoId: string) => {
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
          <label htmlFor="filtro-eixo" className="sr-only">
            Filtrar por Eixo Estratégico
          </label>
          <select
            id="filtro-eixo"
            className={styles.filterSelect}
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
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filtro-secretaria" className="sr-only">
            Filtrar por Secretaria
          </label>
          <select
            id="filtro-secretaria"
            className={styles.filterSelect}
            value={filtroSecretaria || ""}
            disabled={isPending}
            onChange={(e) => handleSecretariaChange(e.target.value)}
          >
            <option value="">
              {filtroEixo
                ? "Todas as Secretarias do Eixo"
                : "Todas as Secretarias"}
            </option>
            {secretariasDisponiveis.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.sigla} - {sec.nome}
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

