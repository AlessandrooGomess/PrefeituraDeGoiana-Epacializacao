"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteObraButton({ obraId, titulo }: { obraId: string; titulo: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirm = window.confirm(`Tem certeza que deseja excluir a obra "${titulo}"?\nEssa ação não poderá ser desfeita.`);
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Falha ao excluir");
      
      alert("Obra excluída com sucesso.");
      router.refresh(); // Recarrega a página para a obra sumir da lista
    } catch {
      alert("Erro ao tentar excluir a obra. Verifique sua conexão.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Excluir Obra"
      style={{
        background: "transparent",
        border: "none",
        color: isDeleting ? "#94a3b8" : "#ef4444",
        cursor: isDeleting ? "not-allowed" : "pointer",
        padding: "8px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Trash2 size={18} />
    </button>
  );
}