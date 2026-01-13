"use client";

import {
  Check,
  Copy,
  FileDown,
  Globe,
  Link as LinkIcon,
  Loader2,
  Lock,
} from "lucide-react";
import { useState } from "react";

interface PublicStatusControlProps {
  isPublic: boolean;
  publicSlug: string | null;
  onToggle: (isPublic: boolean) => Promise<void>;
  onGenerateSlug: () => Promise<string>;
  onExportPdf?: () => void;
}

export function PublicStatusControl({
  isPublic,
  publicSlug,
  onToggle,
  onGenerateSlug,
  onExportPdf,
}: PublicStatusControlProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = publicSlug
    ? `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/sop/${publicSlug}`
    : null;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(!isPublic);
    } finally {
      setIsToggling(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateSlug();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md print:hidden">
      <div className="p-4 space-y-5">
        {/* Status Toggle Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
            {isPublic ? (
              <>
                <Globe className="h-4 w-4 text-green-500" />
                Público
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-gray-400" />
                Privado
              </>
            )}
          </span>

          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPublic ? "bg-green-500" : "bg-gray-200"
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

        {/* Public Settings */}
        {isPublic && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {publicSlug ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link Público
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 truncate select-all">
                      {publicUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 shrink-0 group shadow-sm"
                    title="Copiar Link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                <span>Gerar Link Público</span>
              </button>
            )}
          </div>
        )}

        {/* Global Actions */}
        <div className="pt-2 border-t border-gray-100">
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
            >
              <FileDown className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
