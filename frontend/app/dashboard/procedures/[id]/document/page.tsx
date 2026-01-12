import {
  DocumentViewer,
  GenerateDocumentButton,
} from "@/components/procedures";
import { getDocument, getGenerationCount } from "@/lib/documents/queries";
import { getProcedure } from "@/lib/procedures/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const [procedure, document, generationInfo] = await Promise.all([
    getProcedure(id, user.id),
    getDocument(id),
    getGenerationCount(id),
  ]);

  if (!procedure) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/procedures/${id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {procedure.title}
                </h1>
                <p className="text-sm text-gray-500">Documento SOP</p>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-10 w-40 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <GenerateDocumentButton
                procedureId={id}
                stepCount={procedure.step_count}
                remaining={generationInfo.remaining}
                hasDocument={!!document}
              />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {document ? (
          <DocumentViewer
            content={document.content}
            onExport={() => {
              // TODO: Implement PDF export
              window.open(`/api/documents/${document.id}/export`, "_blank");
            }}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento gerado
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Clique em &quot;Gerar Documento SOP&quot; para criar um documento
              profissional a partir dos passos gravados deste procedimento.
            </p>
            {procedure.step_count === 0 && (
              <p className="text-amber-600 text-sm">
                ⚠️ Este procedimento não possui passos. Adicione passos
                primeiro.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
