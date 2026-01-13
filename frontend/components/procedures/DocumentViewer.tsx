"use client";

import type { SOPDocumentContent } from "@/types/database";
import { CheckCircle, Edit2, FileDown } from "lucide-react";
import Image from "next/image";

interface DocumentViewerProps {
  content: SOPDocumentContent;
  branding?: {
    color?: string | null;
    logoUrl?: string | null;
    name?: string | null;
  };
  authorName?: string | null;
  onExport?: () => void;
  onEdit?: () => void;
}

export function DocumentViewer({
  content,
  branding,
  authorName,
  onExport,
  onEdit,
}: DocumentViewerProps) {
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  return (
    <article
      id="sop-document"
      className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* Brand Identity */}
          {(branding?.logoUrl || branding?.name) && (
            <div className="flex items-center gap-3">
              {branding?.logoUrl && (
                <img
                  src={branding.logoUrl}
                  alt={branding?.name || "Company Logo"}
                  className="h-12 w-auto object-contain"
                />
              )}
              {branding?.name && (
                <span className="text-lg font-bold text-gray-900">
                  {branding.name}
                </span>
              )}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>Versão {content.version}</span>
          <span>•</span>
          <span>
            Gerado em{" "}
            {new Date(content.generatedAt).toLocaleDateString("pt-BR")}
          </span>
          {authorName && (
            <>
              <span>•</span>
              <span>Gerado por: {authorName}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div id="sop-document-actions" className="mt-6 flex gap-3">
          {onExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>
          )}
        </div>
      </header>

      {/* Purpose Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {content.sections.purpose.title}
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          {content.sections.purpose.content}
        </p>
      </section>

      {/* Prerequisites Section */}
      {content.sections.prerequisites.items &&
        content.sections.prerequisites.items.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {content.sections.prerequisites.title}
            </h2>
            <ul className="space-y-3">
              {content.sections.prerequisites.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* Steps Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Passos</h2>
        <div className="space-y-10">
          {content.sections.steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              {/* Step number */}
              <div
                className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg"
                style={
                  branding?.color
                    ? { backgroundColor: branding.color }
                    : undefined
                }
              >
                {step.number}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-700 mb-4 text-lg">{step.description}</p>

                {/* Screenshot */}
                {step.screenshotUrl && (
                  <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden border border-gray-200 mb-4 shadow-sm">
                    <Image
                      src={step.screenshotUrl}
                      alt={`Passo ${step.number}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                )}

                {/* Notes */}
                {step.notes && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-base text-amber-900">
                    💡 {step.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conclusion Section */}
      <section className="pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {content.sections.conclusion.title}
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          {content.sections.conclusion.content}
        </p>
      </section>
    </article>
  );
}
