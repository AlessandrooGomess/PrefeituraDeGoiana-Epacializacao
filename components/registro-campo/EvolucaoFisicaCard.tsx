interface EtapaPreview {
  nome: string;
  percentual: number;
}

interface EvolucaoFisicaCardProps {
  etapas?: EtapaPreview[];
}

export function EvolucaoFisicaCard({
  etapas = [
    { nome: "Alvenaria", percentual: 65 },
    { nome: "Instalações Elétricas", percentual: 20 },
  ],
}: EvolucaoFisicaCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-xs">
      <h3 className="text-sm md:text-lg font-bold text-slate-900">Evolução Física da Etapa</h3>
      {/* Mobile: etapas empilhadas | Tablet+: duas colunas separadas por linha vertical */}
      <div className="mt-3.5 grid gap-3 md:grid-cols-2 md:gap-y-4 md:gap-x-0">
        {etapas.map((etapa) => (
          // Mobile: nome e % na mesma linha, barra abaixo | Tablet+: nome acima, barra com % à direita
          <div
            key={etapa.nome}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 md:odd:pr-6 md:even:border-l md:even:border-slate-200 md:even:pl-6"
          >
            <span className="col-start-1 row-start-1 text-xs md:text-sm font-medium text-slate-700">
              {etapa.nome}
            </span>
            <span className="col-start-2 row-start-1 md:row-start-2 text-xs md:text-sm font-semibold text-blue-600">
              {etapa.percentual}%
            </span>
            <div
              className="col-span-2 row-start-2 md:col-span-1 md:col-start-1 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`Evolução de ${etapa.nome}`}
              aria-valuenow={etapa.percentual}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${etapa.percentual}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
