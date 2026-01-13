"use client";

import { FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface GenerateDocumentButtonProps {
  procedureId: string;
  stepCount: number;
  remaining?: number;
  hasDocument?: boolean;
  onGenerated?: (document: unknown) => void;
}

export function GenerateDocumentButton({
  procedureId,
  stepCount,
  remaining = 5,
  hasDocument = false,
  onGenerated,
}: GenerateDocumentButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = stepCount > 0 && remaining > 0;

  async function handleGenerate() {
    if (!canGenerate || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ procedureId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar documento");
      }

      onGenerated?.(data.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            canGenerate && !isGenerating
              ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }
        `}
        title={
          stepCount === 0
            ? "Adicione passos ao procedimento primeiro"
            : remaining === 0
            ? "Limite diário atingido"
            : undefined
        }
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Gerando documento...
          </>
        ) : hasDocument ? (
          <>
            <Sparkles className="h-4 w-4" />
            Regenerar Documento
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            Gerar Documento SOP
          </>
        )}
      </button>

      {/* Remaining count */}
      <span className="text-xs text-gray-500">
        {remaining} geração(ões) restante(s) hoje
      </span>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
          <button
            onClick={handleGenerate}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Disabled reason */}
      {stepCount === 0 && (
        <span className="text-xs text-amber-600">
          ⚠️ Adicione passos para habilitar geração
        </span>
      )}
    </div>
  );
}
