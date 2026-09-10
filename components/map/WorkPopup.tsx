import type { ObraItem } from "@/types/obra";
import { formatWorkForecast, getWorkProgress, STATUS_PRESENTATION } from "./workPresentation";

/**
 * Cria o conteúdo DOM do popup exigido pelo MapLibre.
 * Usar nós DOM, em vez de interpolar HTML, mantém o texto da API seguro por padrão.
 */
export function createWorkPopupContent(obra: ObraItem): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "obra-popup";

  const tag = document.createElement("span");
  tag.className = "obra-popup__tag";
  tag.textContent = obra.secretaria?.sigla || "OBRA";

  const title = document.createElement("h3");
  title.textContent = obra.titulo;

  const meta = document.createElement("div");
  meta.className = "obra-popup__meta";
  const status = document.createElement("span");
  status.textContent = `● ${STATUS_PRESENTATION[obra.status].label}`;
  meta.append(status);

  const forecast = formatWorkForecast(obra.previsaoConclusao);
  if (forecast) {
    const forecastElement = document.createElement("span");
    forecastElement.textContent = `▣ Previsão: ${forecast}`;
    meta.append(forecastElement);
  }

  const progress = document.createElement("div");
  progress.className = "obra-popup__progress";
  const progressBar = document.createElement("span");
  progressBar.style.width = `${getWorkProgress(obra.percentualExecutado)}%`;
  progress.append(progressBar);

  root.append(tag, title, meta, progress);
  return root;
}
