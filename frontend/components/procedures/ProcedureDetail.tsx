"use client";

import {
  generateDocumentSlugClient,
  toggleDocumentPublicClient,
} from "@/lib/documents/mutations.client";
import { getErrorMessage } from "@/lib/procedures/errors";
import {
  deleteProcedureClient,
  updateProcedureClient,
} from "@/lib/procedures/mutations.client";
import type { ProcedureWithSteps, SOPDocument } from "@/types/database";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DocumentViewer } from "./DocumentViewer";
import { GenerateDocumentButton } from "./GenerateDocumentButton";
import { ProcedureHeader } from "./ProcedureHeader";
import { ProcedureTimeline } from "./ProcedureTimeline";
import { PublicStatusControl } from "./PublicStatusControl";
import { ShareDialog } from "./ShareDialog";

interface ProcedureDetailProps {
  procedure: ProcedureWithSteps;
  document?: SOPDocument | null;
}

export function ProcedureDetail({
  procedure,
  document: initialDocument,
}: ProcedureDetailProps) {
  const router = useRouter();
  const [currentProcedure, setCurrentProcedure] = useState(procedure);
  const [currentDocument, setCurrentDocument] = useState<SOPDocument | null>(
    initialDocument ?? null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync document state when prop changes (e.g., after navigation)
  useEffect(() => {
    setCurrentDocument(initialDocument ?? null);
  }, [initialDocument]);

  // Sync procedure state when prop changes
  useEffect(() => {
    setCurrentProcedure(procedure);
  }, [procedure]);

  const handleUpdate = useCallback(
    async (updates: { title?: string; description?: string | null }) => {
      setError(null);
      setIsUpdating(true);

      try {
        const updated = await updateProcedureClient(procedure.id, updates);
        setCurrentProcedure((prev) => ({ ...prev, ...updated }));
        router.refresh();
      } catch (err) {
        const message = getErrorMessage(err, "update");
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [procedure.id, router]
  );

  const handleDelete = useCallback(async () => {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteProcedureClient(procedure.id);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = getErrorMessage(err, "delete");
      setError(message);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [procedure.id, router]);

  const handleGenerateSlug = useCallback(async () => {
    if (!currentDocument) {
      throw new Error("Gere um documento SOP primeiro");
    }

    setError(null);

    try {
      const result = await generateDocumentSlugClient(currentDocument.id);
      setCurrentDocument((prev) =>
        prev
          ? {
              ...prev,
              is_public: result.is_public,
              public_slug: result.public_slug,
            }
          : null
      );
      router.refresh();
      return result.public_slug;
    } catch (err) {
      const message = getErrorMessage(err, "save");
      setError(message);
      throw err;
    }
  }, [currentDocument, router]);

  const handleTogglePublic = useCallback(
    async (isPublic: boolean) => {
      if (!currentDocument) return;

      setError(null);

      try {
        await toggleDocumentPublicClient(currentDocument.id, isPublic);
        setCurrentDocument((prev) =>
          prev
            ? {
                ...prev,
                is_public: isPublic,
                public_slug: isPublic ? prev.public_slug : null,
              }
            : null
        );
        router.refresh();
      } catch (err) {
        const message = getErrorMessage(err, "update");
        setError(message);
        throw err;
      }
    },
    [currentDocument, router]
  );

  const handleDocumentGenerated = useCallback(
    (doc: unknown) => {
      // Update local state with the generated document
      setCurrentDocument(doc as SOPDocument);
      router.refresh();
    },
    [router]
  );

  const canShare = !!currentDocument;

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <ProcedureHeader
        procedure={currentProcedure}
        documentIsPublic={currentDocument?.is_public}
        documentViewsCount={currentDocument?.views_count}
        onUpdate={handleUpdate}
        onDelete={() => setShowDeleteDialog(true)}
        onShare={canShare ? () => setShowShareDialog(true) : undefined}
        isUpdating={isUpdating}
      />
      <div className="h-px bg-gray-200" />
      {/* SOP Document Section */}
      {/* SOP Document Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documento SOP
          </h2>
          <GenerateDocumentButton
            procedureId={procedure.id}
            stepCount={procedure.steps.length}
            hasDocument={!!currentDocument}
            onGenerated={handleDocumentGenerated}
          />
        </div>

        {currentDocument ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Document */}
            <div className="lg:col-span-2">
              <DocumentViewer content={currentDocument.content} />
            </div>

            {/* Right Column: Controls & Metadata */}
            <div className="space-y-6">
              <PublicStatusControl
                isPublic={currentDocument.is_public}
                publicSlug={currentDocument.public_slug}
                onToggle={handleTogglePublic}
                onGenerateSlug={handleGenerateSlug}
                onExportPdf={() => window.print()}
              />

              {/* Future: Add more sidebar items here (e.g. Version history, Export other formats) */}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Nenhum documento SOP gerado ainda
            </p>
            <p className="text-sm text-gray-500">
              Clique em &quot;Gerar Documento SOP&quot; para criar um documento
              profissional
            </p>
          </div>
        )}
      </section>
      <div className="h-px bg-gray-200" />
      {/* Steps Timeline */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Passos Gravados</h2>
        <ProcedureTimeline steps={procedure.steps} />
      </section>
      {/* Delete dialog */}
      {showDeleteDialog && (
        <DeleteConfirmDialog
          title={currentProcedure.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isDeleting={isDeleting}
        />
      )}
      {/* Share dialog - for SOP document */}
      {showShareDialog && currentDocument && (
        <ShareDialog
          sopDocument={currentDocument}
          procedureTitle={currentProcedure.title}
          onClose={() => setShowShareDialog(false)}
          onGenerateSlug={handleGenerateSlug}
          onTogglePublic={handleTogglePublic}
        />
      )}
    </div>
  );
}
