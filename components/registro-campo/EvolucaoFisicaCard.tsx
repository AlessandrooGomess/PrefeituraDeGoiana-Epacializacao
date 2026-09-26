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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900">Evolução Física da Etapa</h3>
      <div className="mt-3.5 space-y-3">
        {etapas.map((etapa) => (
          <div key={etapa.nome} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700">{etapa.nome}</span>
              <span className="font-semibold text-blue-600">{etapa.percentual}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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