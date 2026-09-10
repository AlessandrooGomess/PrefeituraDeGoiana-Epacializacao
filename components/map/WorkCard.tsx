import type { ObraItem } from "@/types/obra";
import { formatWorkForecast, getWorkProgress, STATUS_PRESENTATION } from "./workPresentation";

interface WorkCardProps {
  obra: ObraItem;
  onClose?: () => void;
  onSelect?: (obra: ObraItem) => void;
  selected?: boolean;
}

/** Apresentação reutilizável de uma obra, independente de API e MapLibre. */
export default function WorkCard({ obra, onClose, onSelect, selected = false }: WorkCardProps) {
  const status = STATUS_PRESENTATION[obra.status];
  const forecast = formatWorkForecast(obra.previsaoConclusao);

  if (onSelect) {
    return <button className={`work-card ${selected ? "work-card--selected" : ""}`} onClick={() => onSelect(obra)} type="button"><span className="preview-category" style={{ color: obra.secretaria.corIdentificacao || "#ec7b2b" }}>{obra.secretaria.sigla}</span><span className="work-card__title">{obra.titulo}</span><span className="preview-meta"><span><i style={{ background: status.color }} /> {status.label}</span>{forecast && <span>▣ Previsão: {forecast}</span>}</span><span className="progress"><span style={{ width: `${getWorkProgress(obra.percentualExecutado)}%` }} /></span></button>;
  }

  return <article className="work-preview">{onClose && <button className="preview-close" onClick={onClose} aria-label="Fechar detalhes">×</button>}<span className="preview-category" style={{ color: obra.secretaria.corIdentificacao || "#ec7b2b" }}>{obra.secretaria.sigla}</span><h2>{obra.titulo}</h2><div className="preview-meta"><span><i style={{ background: status.color }} /> {status.label}</span>{forecast && <span>▣ Previsão: {forecast}</span>}</div><div className="progress"><span style={{ width: `${getWorkProgress(obra.percentualExecutado)}%` }} /></div><button className="details-button" type="button">Ver Detalhes Completos</button></article>;
}
