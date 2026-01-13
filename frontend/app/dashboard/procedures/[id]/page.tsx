import { ProcedureDetail } from "@/components/procedures/ProcedureDetail";
import { ProcedureDetailSkeleton } from "@/components/procedures/ProcedureDetailSkeleton";
import { getDocument } from "@/lib/documents/queries";
import { getProcedure } from "@/lib/procedures/queries";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ProcedurePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProcedureDetailSkeleton />}>
      <ProcedureContent id={id} />
    </Suspense>
  );
}

interface ProcedureContentProps {
  id: string;
}

async function ProcedureContent({ id }: ProcedureContentProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user branding
  const { data } = await supabase
    .from("users")
    .select("brand_color, brand_logo_url, brand_name")
    .eq("id", user.id)
    .single();

  const profile = data as any;

  const procedure = await getProcedure(id, user.id);

  if (!procedure) {
    notFound();
  }

  // Fetch SOP document if exists
  const document = await getDocument(id);

  // Generate signed URLs for screenshots if document exists
  const enrichedDocument = document
    ? {
        ...document,
        content: await enrichContentWithSignedUrls(document.content),
      }
    : null;

  return (
    <ProcedureDetail
      procedure={procedure}
      document={enrichedDocument}
      branding={{
        color: profile?.brand_color,
        logoUrl: profile?.brand_logo_url,
        name: profile?.brand_name,
      }}
    />
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
