"use client";

import { useState } from "react";

export interface EtapaReal {
  id: string;
  status: string;
  percentualConcluido: number;
  template: {
    nome: string;
    nomeCidadao: string;
    peso: number;
    ordem: number;
  };
}

interface EvolucaoFisicaCardProps {
  obraId: string;
  etapas: EtapaReal[];
  progressoGeral: number;
  onEtapaAtualizada: (etapaId: string, concluida: boolean, novoProgresso: number) => void;
  somenteLeitura?: boolean;
  mensagemBloqueio?: string;
}

export function EvolucaoFisicaCard({
  obraId,
  etapas,
  progressoGeral,
  onEtapaAtualizada,
  somenteLeitura = false,
  mensagemBloqueio,
}: EvolucaoFisicaCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleEtapa(etapaId: string, marcarConcluida: boolean) {
    setLoading(etapaId);
    try {
      const res = await fetch(`/api/obras/${obraId}/etapas/${etapaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concluida: marcarConcluida }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar etapa.");

      const data = await res.json();
      onEtapaAtualizada(etapaId, marcarConcluida, data.progressoGeral);
    } catch {
      alert("Erro ao atualizar a etapa. Verifique sua conexão.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-lg font-bold text-slate-900">
          Evolução Física da Obra
        </h3>
        <span className="text-sm font-bold text-blue-600">
          {Math.round(progressoGeral)}%
        </span>
      </div>

      {/* Barra de progresso geral */}
      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Progresso geral da obra"
        aria-valuenow={Math.round(progressoGeral)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progressoGeral}%` }}
        />
      </div>

      {/* Lista de etapas com checkbox */}
      <div className="mt-4 divide-y divide-slate-100">
        {etapas.map((etapa) => {
          const concluida = etapa.status === "CONCLUIDA";
          const isLoading = loading === etapa.id;

          return (
            <label
              key={etapa.id}
              className={`flex items-center gap-3 py-3 ${somenteLeitura ? "cursor-not-allowed opacity-80" : "cursor-pointer"} ${
                isLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={concluida}
                onChange={() => { if (!somenteLeitura) toggleEtapa(etapa.id, !concluida); }}
                disabled={isLoading || somenteLeitura}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    concluida
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {etapa.template.nomeCidadao || etapa.template.nome}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  (peso {etapa.template.peso})
                </span>
              </div>
              {concluida && (
                <span className="text-xs font-semibold text-emerald-600">
                  Concluída
                </span>
              )}
            </label>
          );
        })}
      </div>

      {etapas.length === 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Nenhuma etapa vinculada a esta obra.
        </p>
      )}
    </div>
  );
}