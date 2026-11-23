import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar, { type SidebarUser } from "@/components/sidebar/Sidebar";
import type { SidebarSettingsUser } from "@/components/sidebar/SidebarSettingsFooter";
import { EngenheiroSidebar } from "./EngenheiroSidebar";

export type EngenheiroUser = SidebarUser & SidebarSettingsUser;

interface EngenheiroShellProps {
  titulo?: string;
  user?: EngenheiroUser | null;
  // Destino do link de retorno (ex.: voltar do registro de campo para o início)
  fecharHref?: string;
  children: ReactNode;
}

// Moldura compartilhada pelas telas da área do engenheiro:
// cabeçalho padronizado do portal e menu lateral (desktop)
export function EngenheiroShell({
  user = null,
  fecharHref,
  children,
}: EngenheiroShellProps) {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8fafc] flex flex-col text-slate-800 antialiased">
      <Sidebar user={user} />

      <div className="flex flex-1">
        {/* Menu Lateral (a partir de 721px, sincronizado com o cabeçalho do portal) */}
        <EngenheiroSidebar user={user} />

        <main className="flex-1 min-w-0 w-full max-w-md min-[721px]:max-w-6xl mx-auto px-4 pt-4 pb-8 min-[721px]:px-8 min-[721px]:pt-8 min-[721px]:pb-12 space-y-3.5 min-[721px]:space-y-5">
          {fecharHref && (
            <div>
              <Link
                href={fecharHref}
                className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar para início
              </Link>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
