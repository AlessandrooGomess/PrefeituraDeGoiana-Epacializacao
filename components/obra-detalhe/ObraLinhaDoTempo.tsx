import { TrendingUp } from "lucide-react";
import type { EstadoMarco, MarcoLinhaDoTempo } from "@/lib/obras/linha-do-tempo";

interface ObraLinhaDoTempoProps {
  marcos: MarcoLinhaDoTempo[];
}

const ESTILO_MARCADOR: Record<EstadoMarco, string> = {
  concluido: "bg-(--cor-principal) border-(--cor-principal)",
  atual: "bg-(--cor-principal) border-(--cor-principal) ring-4 ring-(--cor-principal)/20",
  paralisado: "bg-white border-[#d34545]",
  pendente: "bg-white border-slate-300",
};

// Marcos da evolução da obra: ordem de serviço e etapas, com destaque para a fase atual
export function ObraLinhaDoTempo({ marcos }: ObraLinhaDoTempoProps) {
  return (
    <section aria-labelledby="evolucao-titulo" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id="evolucao-titulo" className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <TrendingUp className="h-5 w-5" aria-hidden="true" />
        Evolução da Obra
      </h2>

      {marcos.length > 0 ? (
        <ol className="mt-5 ml-1.5 space-y-5 border-l border-slate-200">
          {marcos.map(({ id, titulo, estado, detalhe }) => (
            <li key={id} className="relative pl-5">
              <span
                aria-hidden="true"
                className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 ${ESTILO_MARCADOR[estado]}`}
              />
              <p className={`text-sm font-semibold ${estado === "atual" ? "text-(--cor-principal)" : "text-slate-800"}`}>
                {titulo}
              </p>
              {estado === "atual" && (
                <span className="mt-1 inline-block rounded bg-(--cor-principal) px-2 py-0.5 text-[10px] font-bold text-white">
                  Fase atual
                </span>
              )}
              <p className={`mt-1 text-xs ${estado === "paralisado" ? "text-[#d34545]" : "text-slate-500"}`}>{detalhe}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Cronograma ainda não divulgado.</p>
      )}
    </section>
  );
}
