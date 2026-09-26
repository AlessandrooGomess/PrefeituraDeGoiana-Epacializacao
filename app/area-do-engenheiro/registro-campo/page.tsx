import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegistroCampoHeader } from "@/components/registro-campo/RegistroCampoHeader";
import { ObraInfoCard } from "@/components/registro-campo/ObraInfoCard";
import { EvolucaoFisicaCard } from "@/components/registro-campo/EvolucaoFisicaCard";
import { RegistroFotograficoCard } from "@/components/registro-campo/RegistroFotograficoCard";
import { IntercorrenciasCard } from "@/components/registro-campo/IntercorrenciasCard";
import { RegistroCampoActions } from "@/components/registro-campo/RegistroCampoActions";
import { BottomNav } from "@/components/registro-campo/BottomNav";

export default async function RegistroCampoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== Role.ENGENHEIRO) {
    redirect("/area-do-servidor");
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800 antialiased">
      {/* Topo Azul */}
      <RegistroCampoHeader backHref="/area-do-engenheiro" />

      {/* Conteúdo Principal com largura controlada para mobile-first */}
      <main className="mx-auto max-w-md px-4 pt-5 pb-8 space-y-4">
        {/* Título e Subtítulo */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Registro de Campo
          </h2>
          <p className="text-xs text-slate-500">
            Preencha os dados da vistoria diária.
          </p>
        </div>

        {/* Card 1: Identificação da Obra */}
        <ObraInfoCard
          titulo="Escola Municipal Centro"
          faseOuLote="Lote 03 - Fase de Estrutura"
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
          gpsAtivo={true}
          fotos={[
            {
              id: "foto-demo-1",
              url: "/fotos/obra-alvenaria.jpg",
              coordenadas: "-23.5505, -46.6333",
            },
          ]}
        />

        {/* Card 4: Intercorrências e Observações Adicionais */}
        <IntercorrenciasCard
          selecionadas={["ATRASO_MATERIAL"]}
          observacoes=""
        />

        {/* Ações: Salvar Rascunho / Enviar Medição */}
        <RegistroCampoActions />
      </main>

      {/* Barra de Navegação Inferior */}
      <BottomNav activeTab="diario" />
    </div>
  );
}