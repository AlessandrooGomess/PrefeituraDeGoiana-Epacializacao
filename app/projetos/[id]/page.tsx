import { notFound } from "next/navigation";
import { ObraCabecalho } from "@/components/obra-detalhe/ObraCabecalho";
import { PortalFooter } from "@/components/portal/PortalFooter";
import Sidebar from "@/components/sidebar/Sidebar";
import { buscarObraPublica } from "@/lib/obras/obra-publica";

export default async function ObraPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await buscarObraPublica(id);

  if (!obra) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] pt-14.5 text-[#0f172a] font-sans antialiased">
      <Sidebar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ObraCabecalho
          titulo={obra.titulo}
          status={obra.status}
          areaTematica={obra.areaTematica?.nome ?? null}
        />
      </main>

      <PortalFooter />
    </div>
  );
}
