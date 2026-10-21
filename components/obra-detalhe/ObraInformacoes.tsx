import { Banknote, Building2, UserCheck, type LucideIcon } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils/currency";

interface ObraInformacoesProps {
  valorContrato: number | null;
  empresaContratada: string | null;
  fiscal: { nome: string; cargo: string | null } | null;
}

interface Informacao {
  rotulo: string;
  icone: LucideIcon;
  valor: string;
  detalhe?: string | null;
}

// Cards com investimento, empresa executora e fiscal da obra; exibe só o que estiver cadastrado
export function ObraInformacoes({ valorContrato, empresaContratada, fiscal }: ObraInformacoesProps) {
  const informacoes: Informacao[] = [];

  if (valorContrato !== null) {
    informacoes.push({ rotulo: "Investimento", icone: Banknote, valor: formatCurrencyBRL(valorContrato) });
  }
  if (empresaContratada) {
    informacoes.push({ rotulo: "Executora", icone: Building2, valor: empresaContratada });
  }
  if (fiscal) {
    informacoes.push({ rotulo: "Fiscalização", icone: UserCheck, valor: fiscal.nome, detalhe: fiscal.cargo });
  }

  if (informacoes.length === 0) return null;

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {informacoes.map(({ rotulo, icone: Icone, valor, detalhe }) => (
        <div key={rotulo} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <Icone className="h-4 w-4" aria-hidden="true" />
            {rotulo}
          </dt>
          <dd className="mt-2 text-lg font-bold leading-snug text-slate-900 break-words">{valor}</dd>
          {detalhe && <dd className="mt-1 text-xs text-slate-500">{detalhe}</dd>}
        </div>
      ))}
    </dl>
  );
}
