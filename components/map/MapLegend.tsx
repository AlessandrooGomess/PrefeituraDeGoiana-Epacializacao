import { STATUS_PRESENTATION } from "./workPresentation";

export default function MapLegend() {
  return (
    <aside className="map-legend" aria-label="Legenda dos status das obras">
      <span className="map-legend__title">Status das obras</span>
      {Object.entries(STATUS_PRESENTATION).map(([status, presentation]) => (
        <span className="map-legend__item" key={status}>
          <i style={{ backgroundColor: presentation.color }} />
          {presentation.label}
        </span>
      ))}
    </aside>
  );
}
