import { CloudRain, Clock, UserX, AlertTriangle, FileQuestion } from "lucide-react";

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

interface IntercorrenciasCardProps {
  selecionadas?: string[];
  onToggle?: (id: string) => void;
  observacoes?: string;
  onChangeObservacoes?: (valor: string) => void;
}

export function IntercorrenciasCard({
  selecionadas = [],
  onToggle,
  observacoes = "",
  onChangeObservacoes,
}: IntercorrenciasCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900">Intercorrências</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {INTERCORRENCIAS_PADRAO.map((item) => {
          const Icon = item.icon;
          const isSelected = selecionadas.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle?.(item.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "border border-blue-600 bg-blue-50 text-blue-700"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">
          Observações Adicionais
        </label>
        <textarea
          rows={3}
          value={observacoes}
          onChange={(e) => onChangeObservacoes?.(e.target.value)}
          placeholder="Descreva problemas com fornecedores, condições climáticas ou outras observações relevantes..."
          className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
}