import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { StatusObra } from "@/types/obra";
import { STATUS_PRESENTATION, getWorkProgress } from "@/components/map/workPresentation";

export interface ObraResponsavel {
  id: string;
  titulo: string;
  bairro: string | null;
  status: StatusObra;
  percentualExecutado: number | null;
}

interface ObraResponsavelCardProps {
  obra: ObraResponsavel;
}

// Card da tela de Início: resume a obra e leva ao formulário já com ela selecionada
export function ObraResponsavelCard({ obra }: ObraResponsavelCardProps) {
  const status = STATUS_PRESENTATION[obra.status];
  const progresso = getWorkProgress(obra.percentualExecutado);

  return (
    <Link
      href={`/area-do-engenheiro/registro-campo?obra=${encodeURIComponent(obra.id)}`}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-2">{obra.titulo}</h3>
          {obra.bairro && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{obra.bairro}</span>
            </p>
          )}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-600">Execução física</span>
          <span className="font-semibold text-blue-600">{progresso}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`Execução física de ${obra.titulo}`}
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      <span className="flex items-center justify-end gap-1 text-xs font-bold text-blue-600">
        Fazer registro
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
