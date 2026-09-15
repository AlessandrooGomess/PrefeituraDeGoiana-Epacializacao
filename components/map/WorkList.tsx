import type { ObraItem } from "@/types/obra";
import WorkCard from "./WorkCard";

interface WorkListProps {
  obras: ObraItem[];
  selectedObraId?: string | null;
  onSelect: (obra: ObraItem) => void;
}

export default function WorkList({ obras, selectedObraId, onSelect }: WorkListProps) {
  return <div className="work-list">{obras.map((obra) => <WorkCard key={obra.id} obra={obra} selected={obra.id === selectedObraId} onSelect={onSelect} />)}</div>;
}
