"use client";

import { Send, Loader2 } from "lucide-react";

interface RegistroCampoActionsProps {
  onSalvarRascunho?: () => void;
  onEnviarMedicao?: () => void;
  loading?: boolean;
  submittingType?: "rascunho" | "envio" | null;
}

export function RegistroCampoActions({
  onSalvarRascunho,
  onEnviarMedicao,
  loading = false,
  submittingType = null,
}: RegistroCampoActionsProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {/* Botão Secundário: Salvar Rascunho */}
      <button
        type="button"
        disabled={loading}
        onClick={onSalvarRascunho}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-600 bg-white py-3 px-3 text-center text-xs font-bold text-blue-600 shadow-xs hover:bg-blue-50/60 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && submittingType === "rascunho" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Salvando...</span>
          </>
        ) : (
          <span>Salvar Rascunho</span>
        )}
      </button>

      {/* Botão Primário: Enviar Medição */}
      <button
        type="button"
        disabled={loading}
        onClick={onEnviarMedicao}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-3 text-center text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && submittingType === "envio" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Send className="h-3.5 w-3.5" />
            <span>Enviar Medição</span>
          </>
        )}
      </button>
    </div>
  );
}