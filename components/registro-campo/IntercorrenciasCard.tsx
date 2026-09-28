"use client";

import { CloudRain, Clock, UserX, AlertTriangle, FileQuestion, AlertCircle, Info } from "lucide-react";

export interface IntercorrenciaOption {
  id: string;
  label: string;
  icon: typeof CloudRain;
}

export const INTERCORRENCIAS_PADRAO: IntercorrenciaOption[] = [
  { id: "CHUVA", label: "Chuva", icon: CloudRain },
  { id: "ATRASO_MATERIAL", label: "Atraso Material", icon: Clock },
  { id: "FALTA_PESSOAL", label: "Falta Pessoal", icon: UserX },
  { id: "ACIDENTE_TRABALHO", label: "Acidente de Trabalho", icon: AlertTriangle },
  { id: "OUTROS", label: "Outros", icon: FileQuestion },
];

const MAX_OBSERVACOES = 5000;

interface IntercorrenciasCardProps {
  selecionadas?: string[];
  onToggle?: (id: string) => void;
  observacoes?: string;
  onChangeObservacoes?: (valor: string) => void;
  erro?: string | null;
}

export function IntercorrenciasCard({
  selecionadas = [],
  onToggle,
  observacoes = "",
  onChangeObservacoes,
  erro,
}: IntercorrenciasCardProps) {
  const caracteresRestantes = MAX_OBSERVACOES - observacoes.length;
  const isPertoDoLimite = caracteresRestantes <= 100 && caracteresRestantes > 0;
  const isLimiteAtingido = caracteresRestantes <= 0;

  // Validação inteligente: se marcou OUTROS, precisa detalhar
  const marcouOutros = selecionadas.includes("OUTROS");
  const precisaDetalharOutros = marcouOutros && observacoes.trim().length < 10;

  // Detecta tentativa de inserção de scripts maliciosos em tempo real
  const contemScriptSuspeito = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(observacoes);

  // Manipulador de digitação com sanitização suave
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let valor = e.target.value;

    // Impede espaços ou quebras de linha no início do texto
    valor = valor.replace(/^\s+/, "");

    // Remove caracteres nulos por segurança
    valor = valor.replace(/\0/g, "");

    // Limita repetições excessivas de quebras de linha (> 3)
    valor = valor.replace(/\n{4,}/g, "\n\n\n");

    onChangeObservacoes?.(valor);
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-xs transition-colors ${
        erro || contemScriptSuspeito
          ? "border-rose-400 bg-rose-50/20"
          : precisaDetalharOutros
          ? "border-amber-300 bg-amber-50/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Intercorrências</h3>
        {selecionadas.length > 0 && (
          <span className="text-[11px] font-semibold text-blue-600">
            {selecionadas.length} marcada{selecionadas.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tags de Intercorrência Estilo Pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {INTERCORRENCIAS_PADRAO.map((item) => {
          const Icon = item.icon;
          const isSelected = selecionadas.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle?.(item.id)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                isSelected
                  ? "border border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Campo de Observações Adicionais */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="observacoes-adicionais" className="text-xs font-semibold text-slate-700">
            Observações Adicionais
            {marcouOutros && <span className="ml-1 text-amber-600 font-bold">*</span>}
          </label>
          <span
            className={`text-[10px] font-medium ${
              isLimiteAtingido
                ? "font-bold text-rose-600"
                : isPertoDoLimite
                ? "font-semibold text-amber-600"
                : "text-slate-400"
            }`}
          >
            {observacoes.length}/{MAX_OBSERVACOES}
          </span>
        </div>

        <textarea
          id="observacoes-adicionais"
          rows={3}
          maxLength={MAX_OBSERVACOES}
          value={observacoes}
          onChange={handleChange}
          placeholder="Descreva problemas com fornecedores, condições climáticas ou outras observações relevantes..."
          className={`w-full rounded-lg border p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 resize-none transition-colors ${
            contemScriptSuspeito || erro
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
              : precisaDetalharOutros
              ? "border-amber-300 focus:border-amber-500 focus:ring-amber-500"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />

        {/* Alerta de script malicioso */}
        {contemScriptSuspeito && (
          <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Código de script HTML não é permitido nas observações.</span>
          </p>
        )}

        {/* Alerta caso tenha marcado OUTROS */}
        {precisaDetalharOutros && !contemScriptSuspeito && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>Você selecionou &quot;Outros&quot;. Por favor, detalhe a ocorrência acima (mínimo de 10 caracteres).</span>
          </p>
        )}

        {/* Alerta de limite de caracteres atingido */}
        {isLimiteAtingido && (
          <p className="text-[10px] font-semibold text-rose-600">
            Limite máximo de 5.000 caracteres atingido.
          </p>
        )}

        {erro && !contemScriptSuspeito && (
          <p className="text-[11px] font-medium text-rose-600">{erro}</p>
        )}
      </div>
    </div>
  );
}