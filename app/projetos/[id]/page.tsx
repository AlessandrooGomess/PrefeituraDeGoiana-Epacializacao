import { notFound } from "next/navigation";
import { ObraCabecalho } from "@/components/obra-detalhe/ObraCabecalho";
import { ObraGaleria } from "@/components/obra-detalhe/ObraGaleria";
import { ObraInformacoes } from "@/components/obra-detalhe/ObraInformacoes";
import { ObraLinhaDoTempo } from "@/components/obra-detalhe/ObraLinhaDoTempo";
import { PortalFooter } from "@/components/portal/PortalFooter";
import Sidebar from "@/components/sidebar/Sidebar";
import { montarLinhaDoTempo } from "@/lib/obras/linha-do-tempo";
import { buscarObraPublica } from "@/lib/obras/obra-publica";
import { formatarTempoDecorrido } from "@/lib/utils/tempo-decorrido";

export default async function ObraPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await buscarObraPublica(id);

  if (!obra) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] pt-14.5 text-[#0f172a] font-sans antialiased">
      <Sidebar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ObraCabecalho
          titulo={obra.titulo}
          status={obra.status}
          areaTematica={obra.areaTematica?.nome ?? null}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <ObraGaleria
              titulo={obra.titulo}
              fotos={obra.fotos.map((foto) => ({
                id: foto.id,
                url: foto.url,
                descricao: foto.descricao,
                tempoDecorrido: formatarTempoDecorrido(foto.dataFoto),
              }))}
            />
            <ObraInformacoes
              valorContrato={obra.valorContrato === null ? null : Number(obra.valorContrato)}
              empresaContratada={obra.empresaContratada}
              fiscal={obra.engenheiro}
            />
          </div>

          <aside className="space-y-6">
            <ObraLinhaDoTempo marcos={montarLinhaDoTempo(obra.dataOrdemServico, obra.etapasObra)} />
          </aside>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
