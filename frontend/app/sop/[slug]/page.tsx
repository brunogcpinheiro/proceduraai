import { DocumentViewer } from "@/components/procedures/DocumentViewer";
import { PublicSOPHeader } from "@/components/sop/PublicSOPHeader";
import { createClient } from "@/lib/supabase/server";
import type { SOPDocument } from "@/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SOPPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPublicDocument(slug: string): Promise<SOPDocument | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sop_documents")
    .select("*")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Increment views (function created by migration 008_sop_public_fields.sql)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)("increment_document_views", { slug });

  return data as SOPDocument;
}

async function getProcedureTitle(procedureId: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("procedures")
    .select("title")
    .eq("id", procedureId)
    .single();

  // Cast to handle TypeScript inference limitations
  const result = data as { title: string } | null;
  return result?.title || "Documento SOP";
}

export default async function PublicSOPPage({ params }: SOPPageProps) {
  const { slug } = await params;
  const document = await getPublicDocument(slug);

  if (!document) {
    notFound();
  }

  // Generate signed URLs for screenshots
  // This allows public access to images in the private 'screenshots' bucket
  const enrichedContent = await enrichContentWithSignedUrls(document.content);

  const procedureTitle = await getProcedureTitle(document.procedure_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PublicSOPHeader viewsCount={document.views_count} />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {procedureTitle}
          </h1>
          <p className="text-gray-500">
            Documento SOP • Versão {document.content.version}
          </p>
        </div>

        {/* Document */}
        <DocumentViewer content={enrichedContent} />

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Gerado com{" "}
            <Link href="/" className="text-primary hover:underline">
              ProceduraAI
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

import { SOPDocumentContent } from "@/types/database";

async function enrichContentWithSignedUrls(
  content: SOPDocumentContent
): Promise<SOPDocumentContent> {
  const supabase = await createClient();
  const newContent = { ...content, sections: { ...content.sections } };

  // Clone steps array to avoid mutation issues
  newContent.sections.steps = [...content.sections.steps];

  // Process steps in parallel
  const signedSteps = await Promise.all(
    newContent.sections.steps.map(async (step) => {
      if (!step.screenshotUrl) return step;

      try {
        // Extract path from URL
        // Expected format: .../screenshots/{path}
        // or just use the path if we stored it correctly.
        // Assuming the URL contains the bucket name 'screenshots'
        const url = new URL(step.screenshotUrl);
        const pathParts = url.pathname.split("/screenshots/");

        if (pathParts.length < 2) return step;

        const filePath = pathParts[1]; // e.g. "user-id/proc-id/step-1.png"

        const { data, error } = await supabase.storage
          .from("screenshots")
          .createSignedUrl(filePath, 3600); // 1 hour validity

        if (error || !data) {
          console.error("Error signing URL:", error);
          return step;
        }

        return {
          ...step,
          screenshotUrl: data.signedUrl,
        };
      } catch (e) {
        console.error("Error processing URL:", e);
        return step;
      }
    })
  );

  newContent.sections.steps = signedSteps;
  return newContent;
}
