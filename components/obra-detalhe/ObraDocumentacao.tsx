import { Download, FileText } from "lucide-react";

// Acesso aos documentos técnicos da obra; o download ainda não existe no sistema
export function ObraDocumentacao() {
  return (
    <section
      aria-labelledby="documentacao-titulo"
      className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-(--cor-principal)/5 p-5 text-center shadow-sm"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--cor-principal)/10 text-(--cor-principal)">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>

      <h2 id="documentacao-titulo" className="text-base font-bold text-slate-900">
        Documentação Técnica
      </h2>
      <p className="text-xs text-slate-600">
        Diário de obras, plantas e medições deste projeto ficarão disponíveis para download em breve.
      </p>

      <button
        type="button"
        disabled
        className="relative mt-1 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-(--cor-principal)/50 px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Baixar Relatórios
        <span className="rounded-full bg-white px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-(--cor-principal)">
          Em breve
        </span>
      </button>
    </section>
  );
}
