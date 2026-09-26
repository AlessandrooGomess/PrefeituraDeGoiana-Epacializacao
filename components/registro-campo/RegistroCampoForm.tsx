"use client";

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle de intercorrências
  const handleToggleIntercorrencia = (id: string) => {
    setIntercorrencias((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Enviar Medição (exige foto)
  const handleEnviarMedicao = async () => {
    if (fotos.length === 0) {
      setFotoErro("Pelo menos uma foto é obrigatória para enviar a medição.");
      return;
    }
    setFotoErro(null);
    setIsSubmitting(true);

    try {
      // Simulação / chamada da API
      alert("Validação aprovada! Enviando registro de campo com fotos e GPS.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Salvar Rascunho (não exige foto)
  const handleSalvarRascunho = async () => {
    setFotoErro(null);
    setIsSubmitting(true);
    try {
      alert("Rascunho salvo com sucesso!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
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
        onChangeObservacoes={setObservacoes}
      />

      {/* Ações: Salvar Rascunho / Enviar Medição */}
      <RegistroCampoActions
        onSalvarRascunho={handleSalvarRascunho}
        onEnviarMedicao={handleEnviarMedicao}
        loading={isSubmitting}
      />
    </div>
  );
}