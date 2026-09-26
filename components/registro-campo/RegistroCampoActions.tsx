"use client";

import { Send } from "lucide-react";

interface RegistroCampoActionsProps {
  onSalvarRascunho?: () => void;
  onEnviarMedicao?: () => void;
  loading?: boolean;
}

export function RegistroCampoActions({
  onSalvarRascunho,
  onEnviarMedicao,
  loading = false,
}: RegistroCampoActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={onSalvarRascunho}
        className="flex-1 rounded-xl border border-blue-600 bg-white py-3 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50/50 transition-colors disabled:opacity-60"
      >
        Salvar Rascunho
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onEnviarMedicao}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        <Send className="h-3.5 w-3.5" />
        <span>Enviar Medição</span>
      </button>
    </div>
  );
}