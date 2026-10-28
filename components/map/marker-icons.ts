import type { ObraItem } from "@/types/obra";

const ICON_PATHS: Record<string, string> = {
  "Infraestrutura Urbana": "M1 22h4V10h6v12h4V10h6v12h4V8L13 2 1 8v14z",
  "Direito à Cidade": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  "Resiliencia Urbana": "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z",
  "Assistência Social": "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "Saúde": "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
  "Esporte e Lazer": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 2.07c3.07.38 5.57 2.52 6.54 5.36L13 5.65V4.07zM11 4.07v1.58L4.46 9.43c.97-2.84 3.47-4.98 6.54-5.36zM4.07 13h5.44l-3.4 4.67C4.78 16.27 4.17 14.71 4.07 13zm3.22 5.73L11 13.52V20c-1.4-.18-2.7-.76-3.71-1.57l.01.3zM13 19.93v-6.41l3.71 5.1c-1.01.81-2.31 1.39-3.71 1.57v-.26zm4.71-2.34L14.49 13h5.44c-.1 1.71-.71 3.27-2.04 4.66l.82-.07z",
  "Educação": "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  "Segurança Pública e Mobilidade Urbana": "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  "Economia Local": "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z",
  "Ciência e Tecnologia": "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  "Agricultura e Pesca": "M17.12 10c.94-1.23 1.55-2.82 1.55-4.5C18.67 2.57 16.46.12 13.8 0l-.05.05C15.17 1.3 16 3.24 16 5.5c0 1.34-.36 2.6-.97 3.69l2.09.81zM12.71 9.44C14.14 8.28 15 6.5 15 4.5 15 2.02 12.98 0 10.5 0S6 2.02 6 4.5c0 2 .86 3.78 2.29 4.94L2 15h3v6c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-6h3l-7.29-5.56z",
  "Patrimônio Histórico": "M6 19h12v2H6v-2zm6-16L2 8v2h20V8L12 3zm8 6H4l8-5 8 5zM5 11h2v6H5v-6zm4 0h2v6H9v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6z",
  "Meio Ambiente": "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.7c.39-.09.79-.16 1.19-.2A17.64 17.64 0 0 1 8 19c2.89 0 5.13.68 6.51 1.35.59.29 1.09.41 1.49.41.41 0 .59-.12.59-.34 0-.68-.73-3.06-1.1-4.42 3.16-1.16 5.51-4.15 5.51-7.67V8h-4z",
  "Inovação e Gestão Administrativa": "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
};

const FALLBACK_ICON = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

const MARKER_WIDTH = 36;
const MARKER_HEIGHT = 44;
const ICON_SIZE = 18;

export function getIconPath(areaTematica?: string | null): string {
  if (!areaTematica) return FALLBACK_ICON;
  return ICON_PATHS[areaTematica] ?? FALLBACK_ICON;
}

export function createMarkerElement(obra: ObraItem): HTMLElement {
  const corEixo = obra.eixo?.cor ?? obra.secretaria?.corIdentificacao ?? "#2563EB";
  const iconPath = getIconPath(obra.areaTematica?.nome);

  const container = document.createElement("div");
  container.className = "custom-map-marker";
  container.style.width = `${MARKER_WIDTH}px`;
  container.style.height = `${MARKER_HEIGHT}px`;
  container.style.cursor = "pointer";
  container.style.opacity = "1";
  container.style.display = "block";
  container.title = obra.titulo;

  container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_WIDTH}" height="${MARKER_HEIGHT}" viewBox="0 0 36 44" fill="none"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 16.2 24.87 16.89 25.42a1.8 1.8 0 0 0 2.22 0C19.8 42.87 36 30.6 36 18 36 8.06 27.94 0 18 0z" fill="${corEixo}"/><circle cx="18" cy="16" r="11" fill="white" fill-opacity="0.95"/><g transform="translate(${(MARKER_WIDTH - ICON_SIZE) / 2}, ${16 - ICON_SIZE / 2}) scale(${ICON_SIZE / 24})"><path d="${iconPath}" fill="${corEixo}"/></g></svg>`;

  return container;
}
