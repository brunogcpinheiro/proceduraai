"use client";

import type { SOPDocument } from "@/types/database";
import {
  Check,
  Copy,
  Globe,
  Link as LinkIcon,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ShareDialogProps {
  sopDocument: SOPDocument;
  procedureTitle: string;
  onClose: () => void;
  onGenerateSlug: () => Promise<string>;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
}

export function ShareDialog({
  sopDocument,
  procedureTitle,
  onClose,
  onGenerateSlug,
  onTogglePublic,
}: ShareDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [publicSlug, setPublicSlug] = useState(sopDocument.public_slug);
  const [isPublic, setIsPublic] = useState(sopDocument.is_public);

  const publicUrl = publicSlug
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/sop/${publicSlug}`
    : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    window.document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const slug = await onGenerateSlug();
      setPublicSlug(slug);
      setIsPublic(true);
    } catch {
      // Error handled in parent
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsToggling(true);
    try {
      await onTogglePublic(!isPublic);
      setIsPublic(!isPublic);
      if (isPublic) {
        setPublicSlug(null);
      }
    } catch {
      // Error handled in parent
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = window.document.createElement("input");
      input.value = publicUrl;
      window.document.body.appendChild(input);
      input.select();
      window.document.execCommand("copy");
      window.document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3
            id="share-dialog-title"
            className="text-lg font-semibold text-gray-900 mb-1"
          >
            Compartilhar SOP
          </h3>
          <p className="text-sm text-gray-500">
            Compartilhe o documento SOP de &quot;{procedureTitle}&quot;
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Public status toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-5 w-5 text-green-500" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isPublic ? "Público" : "Privado"}
              </span>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPublic ? "bg-primary" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Link section */}
          {isPublic && publicSlug ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Link público
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 truncate">
                    {publicUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isPublic && !publicSlug ? (
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando link...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Gerar link público
                </>
              )}
            </button>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Ative o modo público para gerar um link de compartilhamento.
            </p>
          )}

          {/* Info note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            💡 Apenas o documento SOP formatado será público. Os passos gravados
            permanecem privados.
          </div>
        </div>
      </div>
    </div>
  );
}
