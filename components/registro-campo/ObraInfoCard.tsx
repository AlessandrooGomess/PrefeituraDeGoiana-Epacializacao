import { Wrench } from "lucide-react";

interface ObraInfoCardProps {
  titulo?: string;
  faseOuLote?: string;
}

export function ObraInfoCard({
  titulo = "Escola Municipal Centro",
  faseOuLote = "Lote 03 - Fase de Estrutura",
}: ObraInfoCardProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
        <Wrench className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-slate-800">{titulo}</h3>
        <p className="truncate text-xs text-slate-500">{faseOuLote}</p>
      </div>
    </div>
  );
}