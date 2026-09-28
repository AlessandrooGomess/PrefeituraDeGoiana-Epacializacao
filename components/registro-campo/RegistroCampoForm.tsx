"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ObraInfoCard, ObraItemResumo } from "./ObraInfoCard";
import { EvolucaoFisicaCard } from "./EvolucaoFisicaCard";
import { RegistroFotograficoCard, FotoItem } from "./RegistroFotograficoCard";
import { IntercorrenciasCard } from "./IntercorrenciasCard";
import { RegistroCampoActions } from "./RegistroCampoActions";

interface RegistroCampoFormProps {
  obras: ObraItemResumo[];
}

export function RegistroCampoForm({ obras }: RegistroCampoFormProps) {
  const [selectedObraId, setSelectedObraId] = useState<string>(
    obras[0]?.id ?? ""
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

  // Estados de feedback e submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState<"rascunho" | "envio" | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  // Alterna seleção de intercorrência
  const handleToggleIntercorrencia = (id: string) => {
    setIntercorrencias((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (observacoesErro) setObservacoesErro(null);
  };

  // Enviar para a API
  const submitRegistro = async (status: "RASCUNHO" | "ENVIADO") => {
    setMensagemSucesso(null);
    setMensagemErro(null);
    setFotoErro(null);
    setObservacoesErro(null);

    // 1. Validação estrita de fotos (apenas se for envio definitivo)
    if (status === "ENVIADO" && fotos.length === 0) {
      setFotoErro("Pelo menos uma foto com registro fotográfico é obrigatória para enviar a medição.");
      return;
    }

    // 2. Validações completas do campo de observações adicionais
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

      // Se for envio definitivo, limpa intercorrências e observações
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
    <div className="space-y-3.5">
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

      {/* Card 2: Evolução Física da Etapa (Reservado para mentoria) */}
      <EvolucaoFisicaCard
        etapas={[
          { nome: "Alvenaria", percentual: 65 },
          { nome: "Instalações Elétricas", percentual: 20 },
        ]}
      />

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