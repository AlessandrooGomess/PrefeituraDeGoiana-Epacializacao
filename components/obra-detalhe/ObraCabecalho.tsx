import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StatusObra } from "@/types/obra";
import { STATUS_PRESENTATION } from "@/components/map/workPresentation";

interface ObraCabecalhoProps {
  titulo: string;
  status: StatusObra;
  areaTematica: string | null;
}

// Trilha de navegação, título e selos (área temática e status) da página da obra
export function ObraCabecalho({ titulo, status, areaTematica }: ObraCabecalhoProps) {
  const { label, color } = STATUS_PRESENTATION[status];

  return (
    <header className="space-y-3">
      <nav aria-label="Trilha de navegação">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          <li>
            <Link href="/projetos" className="hover:text-(--cor-principal) transition-colors">
              Projetos
            </Link>
          </li>
          {areaTematica && (
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              {areaTematica}
            </li>
          )}
          <li className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span aria-current="page" className="truncate font-semibold text-slate-800">
              {titulo}
            </span>
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl sm:text-4xl font-extrabold text-(--cor-principal) tracking-tight">{titulo}</h1>

      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {areaTematica && (
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-700">
            {areaTematica}
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          {label}
        </span>
      </div>
    </header>
  );
}
