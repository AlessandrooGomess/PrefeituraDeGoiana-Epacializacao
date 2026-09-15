import styles from "./WorkCard.module.css";
import type { ObraItem } from "@/types/obra";
import { formatWorkForecast, getWorkProgress, STATUS_PRESENTATION } from "./workPresentation";

interface WorkCardProps {
  obra: ObraItem;
  onClose?: () => void;
  onSelect?: (obra: ObraItem) => void;
  selected?: boolean;
}

export default function WorkCard({ obra, onClose, onSelect, selected = false }: WorkCardProps) {
  const status = STATUS_PRESENTATION[obra.status];
  const forecast = formatWorkForecast(obra.previsaoConclusao);

  if (onSelect) {
    return (
      <button
        className={`${styles.workCard} ${selected ? styles.workCardSelected : ""}`}
        onClick={() => onSelect(obra)}
        type="button"
      >
        <span className={styles.previewCategory} style={{ color: obra.secretaria.corIdentificacao || "#ec7b2b" }}>
          {obra.secretaria.sigla}
        </span>
        <span className={styles.workCardTitle}>{obra.titulo}</span>
        <span className={styles.previewMeta}>
          <span><i style={{ background: status.color }} /> {status.label}</span>
          {forecast && <span>▣ Previsão: {forecast}</span>}
        </span>
        <span className={styles.progress}>
          <span style={{ width: `${getWorkProgress(obra.percentualExecutado)}%` }} />
        </span>
      </button>
    );
  }

  return (
    <article className={styles.workPreview}>
      {onClose && (
        <button className={styles.previewClose} onClick={onClose} aria-label="Fechar detalhes">
          ×
        </button>
      )}
      <span className={styles.previewCategory} style={{ color: obra.secretaria.corIdentificacao || "#ec7b2b" }}>
        {obra.secretaria.sigla}
      </span>
      <h2 className={styles.previewTitle}>{obra.titulo}</h2>
      <div className={styles.previewMeta}>
        <span><i style={{ background: status.color }} /> {status.label}</span>
        {forecast && <span>▣ Previsão: {forecast}</span>}
      </div>
      <div className={styles.progress}>
        <span style={{ width: `${getWorkProgress(obra.percentualExecutado)}%` }} />
      </div>
      <button className={styles.detailsButton} type="button">
        Ver Detalhes Completos
      </button>
    </article>
  );
}
