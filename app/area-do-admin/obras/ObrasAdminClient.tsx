"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import DeleteObraButton from "@/app/area-do-servidor/DeleteObraButton";
import type { StatusObra } from "@prisma/client";

const STATUS_LABEL: Record<StatusObra, string> = {
  PLANEJADA: "Em planejamento",
  ORDEM_EMITIDA: "Ordem emitida",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

interface ObraAdminItem {
  id: string;
  titulo: string;
  bairro: string;
  status: StatusObra;
  secretaria: {
    id: string;
    nome: string;
    sigla: string;
  };
}

interface SecretariaOption {
  id: string;
  nome: string;
  sigla: string;
}

export default function ObrasAdminClient({
  obras,
  secretarias,
}: {
  obras: ObraAdminItem[];
  secretarias: SecretariaOption[];
}) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("TODOS");
  const [secretariaFiltro, setSecretariaFiltro] = useState<string>("TODAS");

  const obrasFiltradas = obras.filter((obra) => {
    const termo = busca.trim().toLowerCase();
    const matchBusca =
      !termo ||
      obra.titulo.toLowerCase().includes(termo) ||
      obra.bairro.toLowerCase().includes(termo) ||
      obra.secretaria.nome.toLowerCase().includes(termo) ||
      obra.secretaria.sigla.toLowerCase().includes(termo);
    const matchStatus = statusFiltro === "TODOS" || obra.status === statusFiltro;
    const matchSec =
      secretariaFiltro === "TODAS" || obra.secretaria.id === secretariaFiltro;

    return matchBusca && matchStatus && matchSec;
  });

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Obras
          </div>
          <h1 className={styles.pageTitle}>Gerenciamento de Obras</h1>
          <p>Visualize, filtre, edite ou exclua obras de todas as secretarias.</p>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeading} style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2>Todas as obras cadastradas</h2>
            <p>
              {obrasFiltradas.length} de {obras.length} obra(s) exibida(s)
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Buscar por título, bairro ou secretaria..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                minHeight: 38,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                minWidth: 240,
              }}
            />
            <select
              value={secretariaFiltro}
              onChange={(e) => setSecretariaFiltro(e.target.value)}
              style={{
                minHeight: 38,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                background: "#fff",
              }}
            >
              <option value="TODAS">Todas as secretarias</option>
              {secretarias.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.sigla} - {sec.nome}
                </option>
              ))}
            </select>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{
                minHeight: 38,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                background: "#fff",
              }}
            >
              <option value="TODOS">Todos os status</option>
              <option value="PLANEJADA">Em planejamento</option>
              <option value="ORDEM_EMITIDA">Ordem emitida</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="PARALISADA">Paralisada</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>
        </div>

        {obrasFiltradas.length ? (
          <div className={styles.workList}>
            {obrasFiltradas.map((obra) => (
              <article className={styles.workRow} key={obra.id}>
                <Link
                  className={styles.workRowLink}
                  href={`/area-do-servidor/obras/${obra.id}`}
                >
                  <strong>{obra.titulo}</strong>
                  <span>
                    {obra.secretaria.sigla} - {obra.secretaria.nome} • Bairro: {obra.bairro}
                  </span>
                </Link>
                <div className={styles.workRowActions}>
                  <span className={styles.statusTag}>
                    {STATUS_LABEL[obra.status] ?? obra.status}
                  </span>
                  <Link
                    className={styles.workAction}
                    href={`/area-do-servidor/obras/${obra.id}`}
                    title="Ver detalhes da obra"
                    aria-label={`Ver detalhes de ${obra.titulo}`}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    className={styles.workAction}
                    href={`/area-do-servidor/obras/${obra.id}?modo=editar`}
                    title="Editar obra"
                    aria-label={`Editar ${obra.titulo}`}
                  >
                    <Pencil size={15} aria-hidden="true" />
                  </Link>
                  <DeleteObraButton obraId={obra.id} titulo={obra.titulo} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            Nenhuma obra encontrada para os filtros selecionados.
          </p>
        )}
      </section>
    </main>
  );
}

