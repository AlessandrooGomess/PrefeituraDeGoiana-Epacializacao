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

  const allowedRoles: Role[] = [Role.ENGENHEIRO, Role.SUPER_ADMIN, Role.GESTAO];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/area-do-servidor");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased">
      {/* Moldura / Container estritamente Mobile-first */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-xl pb-24 relative border-x border-slate-200">
        {/* Topo Azul com botão fechar */}
        <RegistroCampoHeader backHref="/area-do-engenheiro" />

        {/* Conteúdo dos Cards */}
        <main className="flex-1 px-4 pt-4 pb-6 space-y-3.5">
          {/* Título e Subtítulo */}
          <div className="space-y-0.5">
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
                url: "/fotos/obra-escola-angelo.jpg",
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

        {/* Barra de Navegação Inferior Fixa */}
        <BottomNav activeTab="diario" />
      </div>
    </div>
  );
}