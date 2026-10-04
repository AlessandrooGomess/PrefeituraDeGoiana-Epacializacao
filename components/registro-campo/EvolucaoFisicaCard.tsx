"use client";

import { useState } from "react";

export interface SubEtapaReal {
  id: string;
  status: string;
  percentualConcluido: number;
  template: {
    nome: string;
    peso: number;
    ordem: number;
  };
}

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
  subEtapas: SubEtapaReal[];
}

interface EvolucaoFisicaCardProps {
  obraId: string;
  etapas: EtapaReal[];
  progressoGeral: number;
  onSubEtapaAtualizada: (etapaId: string, subEtapaId: string, concluida: boolean, novoProgressoGeral: number, etapaAtualizada: { status: string, percentualConcluido: number }) => void;
  somenteLeitura?: boolean;
  mensagemBloqueio?: string;
}

export function EvolucaoFisicaCard({
  obraId,
  etapas,
  progressoGeral,
  onSubEtapaAtualizada,
  somenteLeitura = false,
  mensagemBloqueio,
}: EvolucaoFisicaCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleSubEtapa(etapaId: string, subEtapaId: string, marcarConcluida: boolean) {
    setLoading(subEtapaId);
    try {
      const res = await fetch(`/api/obras/${obraId}/subetapas/${subEtapaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concluida: marcarConcluida }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar sub-etapa.");

      const data = await res.json();
      onSubEtapaAtualizada(etapaId, subEtapaId, marcarConcluida, data.progressoGeral, data.etapa);
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

      {mensagemBloqueio && somenteLeitura && (
         <p className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
           {mensagemBloqueio}
         </p>
      )}

      {/* Lista de etapas e sub-etapas */}
      <div className="mt-5 space-y-4">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-slate-800 text-sm">
                {etapa.template.nomeCidadao || etapa.template.nome}
              </span>
              <span className="text-xs font-bold text-slate-500">{Math.round(etapa.percentualConcluido)}%</span>
            </div>
            
            <div className="divide-y divide-slate-100 bg-white rounded-md border border-slate-100">
              {etapa.subEtapas && etapa.subEtapas.length > 0 ? (
                etapa.subEtapas.map((sub) => {
                  const concluida = sub.status === "CONCLUIDA";
                  const isLoading = loading === sub.id;

                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center gap-3 py-2 px-3 ${somenteLeitura ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:bg-slate-50"} ${
                        isLoading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={concluida}
                        onChange={() => { if (!somenteLeitura) toggleSubEtapa(etapa.id, sub.id, !concluida); }}
                        disabled={isLoading || somenteLeitura}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className={`text-sm ${concluida ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          {sub.template.nome}
                        </span>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="p-2 text-xs text-slate-400 text-center">Nenhuma sub-etapa cadastrada.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {etapas.length === 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Nenhuma etapa vinculada a esta obra.
        </p>
      )}
    </div>
  );
}