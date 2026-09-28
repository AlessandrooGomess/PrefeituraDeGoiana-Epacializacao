import { Home, BookOpen, CheckSquare, MessageSquare } from "lucide-react";
import Link from "next/link";

interface BottomNavProps {
  activeTab?: "inicio" | "diario" | "checklist" | "ouvidoria";
}

export function BottomNav({ activeTab = "diario" }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white py-2 shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-4">
        <Link
          href="/area-do-engenheiro"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === "inicio" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Início</span>
        </Link>

        <Link
          href="/area-do-engenheiro/registro-campo"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-white"
        >
          <div className="flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>Diário</span>
            </div>
          </div>
        </Link>

        <Link
          href="/area-do-engenheiro/checklist"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === "checklist" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          <span>Checklist</span>
        </Link>

        <Link
          href="/area-do-engenheiro/ouvidoria"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activeTab === "ouvidoria" ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Ouvidoria</span>
        </Link>
      </div>
    </nav>
  );
}