"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ObraInfoCard, ObraItemResumo } from "./ObraInfoCard";
import { EvolucaoFisicaCard, EtapaReal } from "./EvolucaoFisicaCard";
import { RegistroFotograficoCard, FotoItem } from "./RegistroFotograficoCard";
import { IntercorrenciasCard } from "./IntercorrenciasCard";
import { RegistroCampoActions } from "./RegistroCampoActions";

interface RegistroCampoFormProps {
  obras: ObraItemResumo[];
  obraInicialId?: string;
}

export function RegistroCampoForm({ obras, obraInicialId }: RegistroCampoFormProps) {
  const [selectedObraId, setSelectedObraId] = useState<string>(
    obraInicialId ?? obras[0]?.id ?? ""
  );
  const [fotos, setFotos] = useState<FotoItem[]>([
    {
      id: "foto-demo-1",
      url: "/fotos/obra-escola-angelo.jpg",
      coordenadasFormatadas: "-23.5505, -46.6333",
      latitude: -23.5505,
      longitude: -46.6333,
    },
  ]);
  const [intercorrencias, setIntercorrencias] = useState<string[]>([
    "ATRASO_MATERIAL",
  ]);
  const [observacoes, setObservacoes] = useState<string>("");
  const [fotoErro, setFotoErro] = useState<string | null>(null);
  const [observacoesErro, setObservacoesErro] = useState<string | null>(null);

  const [etapas, setEtapas] = useState<EtapaReal[]>([]);
  const [progressoGeral, setProgressoGeral] = useState<number>(0);
  const [etapasCarregadas, setEtapasCarregadas] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState<"rascunho" | "envio" | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedObraId) return;

    setEtapasCarregadas(false);
    fetch(`/api/obras/${selectedObraId}/etapas`)
      .then((res) => res.json())
      .then((data) => {
        setEtapas(data.etapas ?? []);
        setProgressoGeral(data.progressoGeral ?? 0);
        setEtapasCarregadas(true);
      })
      .catch(() => {
        setEtapas([]);
        setProgressoGeral(0);
        setEtapasCarregadas(true);
      });
  }, [selectedObraId]);

  const handleToggleIntercorrencia = (id: string) => {
    setIntercorrencias((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (observacoesErro) setObservacoesErro(null);
  };

  const submitRegistro = async (status: "RASCUNHO" | "ENVIADO") => {
    setMensagemSucesso(null);
    setMensagemErro(null);
    setFotoErro(null);
    setObservacoesErro(null);

    if (status === "ENVIADO" && fotos.length === 0) {
      setFotoErro("Pelo menos uma foto com registro fotográfico é obrigatória para enviar a medição.");
      return;
    }

    const obsTrim = observacoes.trim();

    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(observacoes)) {
      setObservacoesErro("Código de script malicioso não é permitido nas observações.");
      return;
    }

    if (observacoes.length > 5000) {
      setObservacoesErro("As observações adicionais não podem ultrapassar 5.000 caracteres.");
      return;
    }

    if (intercorrencias.includes("OUTROS") && obsTrim.length < 10) {
      setObservacoesErro(
        "Ao selecionar 'Outros', detalhe o motivo nas observações adicionais (mínimo de 10 caracteres)."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmittingType(status === "RASCUNHO" ? "rascunho" : "envio");

    const payload = {
      status,
      intercorrencias,
      observacoes: obsTrim || null,
      fotos: fotos.map((f) => ({
        url: f.url.startsWith("blob:") ? "/fotos/obra-escola-angelo.jpg" : f.url,
        descricao: f.descricao ?? null,
        latitude: f.latitude ?? null,
        longitude: f.longitude ?? null,
      })),
    };

    try {
      const obraIdTarget = selectedObraId || obras[0]?.id;
      if (!obraIdTarget) {
        throw new Error("Nenhuma obra selecionada para a vistoria.");
      }

      const res = await fetch(`/api/obras/${obraIdTarget}/registros-campo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao processar a solicitação.");
      }

      setMensagemSucesso(
        status === "RASCUNHO"
          ? "Rascunho da vistoria salvo com sucesso!"
          : "Medição de campo enviada com sucesso!"
      );

      if (status === "ENVIADO") {
        setIntercorrencias([]);
        setObservacoes("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao salvar vistoria.";
      setMensagemErro(msg);
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* Mensagem de Sucesso */}
      {mensagemSucesso && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Mensagem de Erro Geral */}
      {mensagemErro && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Card 1: Identificação da Obra */}
      <ObraInfoCard
        obras={obras}
        selectedObraId={selectedObraId}
        onSelectObra={setSelectedObraId}
        tituloFallback="Escola Municipal Centro"
        subtituloFallback="Lote 03 - Fase de Estrutura"
      />

            {/* Card 2: Evolução Física da Obra - Checklist real */}
      {etapasCarregadas && (
        <EvolucaoFisicaCard
          obraId={selectedObraId}
          etapas={etapas}
          progressoGeral={progressoGeral}
          onEtapaAtualizada={(etapaId, concluida, novoProgresso) => {
            setEtapas((prev) =>
              prev.map((e) =>
                e.id === etapaId
                  ? { ...e, status: concluida ? "CONCLUIDA" : "PENDENTE", percentualConcluido: concluida ? 100 : 0 }
                  : e
              )
            );
            setProgressoGeral(novoProgresso);
          }}
        />
      )}

      {/* Cards 3 e 4: empilhados no mobile, lado a lado a partir do tablet */}
      <div className="grid gap-3.5 md:grid-cols-2 md:gap-5">
        {/* Card 3: Registro Fotográfico com GPS */}
        <RegistroFotograficoCard
          fotos={fotos}
          onChangeFotos={(novas) => {
            setFotos(novas);
            if (novas.length > 0) setFotoErro(null);
          }}
          erro={fotoErro}
        />

        {/* Card 4: Intercorrências e Observações Adicionais */}
        <IntercorrenciasCard
          selecionadas={intercorrencias}
          onToggle={handleToggleIntercorrencia}
          observacoes={observacoes}
          onChangeObservacoes={(val) => {
            setObservacoes(val);
            if (observacoesErro) setObservacoesErro(null);
          }}
          erro={observacoesErro}
        />
      </div>

      {/* Ações: Salvar Rascunho / Enviar Medição */}
      <RegistroCampoActions
        onSalvarRascunho={() => submitRegistro("RASCUNHO")}
        onEnviarMedicao={() => submitRegistro("ENVIADO")}
        loading={isSubmitting}
        submittingType={submittingType}
      />
    </div>
  );
}