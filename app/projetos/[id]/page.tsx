import { notFound } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { buscarObraPublica } from "@/lib/obras/obra-publica";

export default async function ObraPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obra = await buscarObraPublica(id);

  if (!obra) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] pt-14.5 text-[#0f172a] font-sans antialiased">
      <Sidebar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-(--cor-principal) tracking-tight">{obra.titulo}</h1>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Coluna principal: galeria de fotos e cards de informações */}
          <div className="space-y-6" />

          {/* Coluna lateral: evolução da obra e documentação */}
          <aside className="space-y-6" />
        </div>
      </main>

      <footer className="bg-(--cor-header-footer) text-slate-300 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-end text-[11px] font-medium space-y-3 sm:space-y-0 sm:space-x-8">
          <a href="#privacidade" className="hover:text-white transition">Privacidade</a>
          <a href="#transparencia" className="hover:text-white transition">Transparência</a>
          <a href="#contato" className="hover:text-white transition">Contato</a>
          <a href="#acessibilidade" className="hover:text-white transition">Acessibilidade</a>
        </div>
      </footer>
    </div>
  );
}
