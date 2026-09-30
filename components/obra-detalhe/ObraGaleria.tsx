"use client";

import Image from "next/image";
import { Images } from "lucide-react";
import { useState } from "react";
import { ObraGaleriaModal } from "./ObraGaleriaModal";

export interface FotoGaleria {
  id: string;
  url: string;
  descricao: string | null;
  // Texto já formatado no servidor, ex.: "há 2 dias"
  tempoDecorrido: string;
}

interface ObraGaleriaProps {
  titulo: string;
  fotos: FotoGaleria[];
}

const MAX_MINIATURAS = 3;

// Foto em destaque da obra com miniaturas para alternar entre as mais recentes
export function ObraGaleria({ titulo, fotos }: ObraGaleriaProps) {
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const fotoSelecionada = fotos[indiceSelecionado];

  // Com mais fotos que miniaturas, a última posição vira o acesso a todas elas
  const temMaisFotos = fotos.length > MAX_MINIATURAS;
  const miniaturas = fotos.slice(0, temMaisFotos ? MAX_MINIATURAS - 1 : MAX_MINIATURAS);

  return (
    <section aria-labelledby="galeria-titulo" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <h2 id="galeria-titulo" className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Registro fotográfico
      </h2>

      {fotoSelecionada ? (
        <>
          <figure className="relative aspect-video overflow-hidden rounded-lg bg-slate-100">
            <Image
              src={fotoSelecionada.url}
              alt={fotoSelecionada.descricao ?? `Foto da obra ${titulo}`}
              fill
              unoptimized
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 max-w-[85%] rounded-md bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow-sm">
              {fotoSelecionada.descricao && (
                <p className="font-semibold text-slate-800">{fotoSelecionada.descricao}</p>
              )}
              <p>Foto atualizada {fotoSelecionada.tempoDecorrido}</p>
            </figcaption>
          </figure>

          {fotos.length > 1 && (
            <ul className="grid grid-cols-3 gap-3">
              {miniaturas.map((foto, indice) => (
                <li key={foto.id}>
                  <button
                    type="button"
                    onClick={() => setIndiceSelecionado(indice)}
                    aria-label={`Exibir foto ${indice + 1}`}
                    aria-pressed={indice === indiceSelecionado}
                    className={`relative block aspect-video w-full overflow-hidden rounded-md bg-slate-100 transition ${
                      indice === indiceSelecionado
                        ? "ring-2 ring-(--cor-principal) ring-offset-2"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image src={foto.url} alt="" fill unoptimized sizes="200px" className="object-cover" />
                  </button>
                </li>
              ))}
              {temMaisFotos && (
                <li>
                  <button
                    type="button"
                    onClick={() => setModalAberto(true)}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-md bg-(--cor-principal)/10 text-xs font-medium text-slate-700 transition-colors hover:bg-(--cor-principal)/20"
                  >
                    <Images className="h-4 w-4" aria-hidden="true" />
                    Ver todas ({fotos.length})
                  </button>
                </li>
              )}
            </ul>
          )}

          {temMaisFotos && (
            <ObraGaleriaModal
              aberto={modalAberto}
              fotos={fotos}
              onSelecionar={(indice) => {
                setIndiceSelecionado(indice);
                setModalAberto(false);
              }}
              onFechar={() => setModalAberto(false)}
            />
          )}
        </>
      ) : (
        <p className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
          Nenhuma foto registrada para esta obra ainda.
        </p>
      )}
    </section>
  );
}
