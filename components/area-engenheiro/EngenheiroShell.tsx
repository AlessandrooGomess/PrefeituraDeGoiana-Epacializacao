import type { ReactNode } from "react";
import { BottomNav, type BottomNavTab } from "@/components/registro-campo/BottomNav";
import { RegistroCampoHeader } from "@/components/registro-campo/RegistroCampoHeader";
import { EngenheiroSidebar } from "./EngenheiroSidebar";

interface EngenheiroShellProps {
  titulo: string;
  // Destino do botão "fechar" do cabeçalho; sem ele, o botão não é exibido
  fecharHref?: string;
  abaAtiva?: BottomNavTab;
  children: ReactNode;
}

// Moldura compartilhada pelas telas da área do engenheiro:
// cabeçalho, menu lateral (tablet/desktop), gaveta (mobile) e barra inferior
export function EngenheiroShell({ titulo, fecharHref, abaAtiva, children }: EngenheiroShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased">
      {/* Moldura mobile-first: coluna de celular no mobile, largura total a partir do tablet */}
      <div className="w-full max-w-md md:max-w-none min-h-screen bg-slate-50 flex flex-col shadow-xl md:shadow-none pb-24 relative border-x border-slate-200 md:border-x-0">
        <RegistroCampoHeader titulo={titulo} backHref={fecharHref} />

        <div className="flex flex-1">
          {/* Menu Lateral (a partir do tablet) */}
          <EngenheiroSidebar />

          <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 pt-4 pb-6 md:px-8 md:pt-8 space-y-3.5 md:space-y-5">
            {children}
          </main>
        </div>

        {/* Barra de Navegação Inferior Fixa */}
        <BottomNav activeTab={abaAtiva} />
      </div>
    </div>
  );
}
