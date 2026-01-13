import { createClient } from "@/lib/supabase/server";
import { resolveScreenshotUrls } from "@/lib/supabase/storage";
import type {
  ProcedureListItem,
  ProcedureStatus,
  ProcedureWithSteps,
  PublicProcedure,
  Step,
} from "@/types/database";

// ============================================================================
// T005: getProcedures - Paginated list query with signed URLs
// ============================================================================

export interface GetProceduresParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProcedureStatus;
}

export interface GetProceduresResult {
  data: ProcedureListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProcedures(
  userId: string,
  params: GetProceduresParams = {}
): Promise<GetProceduresResult> {
  const { page = 1, pageSize = 20, search, status } = params;
  const supabase = await createClient();

  // Calculate range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query
  let query = supabase
    .from("procedures")
    .select(
      "id, title, status, step_count, thumbnail_url, created_at, sop_documents(is_public, views_count)",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Apply search filter
  if (search && search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  // Apply status filter
  if (status) {
    query = query.eq("status", status);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Erro ao carregar procedimentos: ${error.message}`);
  }

  const rawData = (data as any[]) ?? [];

  const procedures: ProcedureListItem[] = rawData.map((p) => {
    // Handle potential array or object from join
    const sopDoc = Array.isArray(p.sop_documents)
      ? p.sop_documents[0]
      : p.sop_documents;

    return {
      id: p.id,
      title: p.title,
      status: p.status,
      step_count: p.step_count,
      thumbnail_url: p.thumbnail_url,
      created_at: p.created_at,
      is_public: sopDoc?.is_public ?? false,
      views_count: sopDoc?.views_count ?? 0,
    };
  });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Resolve signed URLs for thumbnails
  const thumbnailPaths = procedures.map((p) => p.thumbnail_url);
  const signedUrls = await resolveScreenshotUrls(thumbnailPaths, "screenshots");

  // Map signed URLs back to procedures
  const proceduresWithSignedUrls = procedures.map((proc, index) => ({
    ...proc,
    thumbnail_url: signedUrls[index],
  }));

  return {
    data: proceduresWithSignedUrls,
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ============================================================================
// T006: getProcedure - Single procedure with steps and signed URLs
// ============================================================================

export async function getProcedure(
  id: string,
  userId: string
): Promise<ProcedureWithSteps | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("procedures")
    .select(
      `
      *,
      steps (*)
    `
    )
    .eq("id", id)
    .eq("user_id", userId)
    .order("order_index", { referencedTable: "steps", ascending: true })
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Erro ao carregar procedimento: ${error.message}`);
  }

  const procedure = data as ProcedureWithSteps;

  // Resolve signed URLs for all step screenshots
  const steps = procedure.steps ?? [];

  // Collect all screenshot paths (prioritize annotated over raw)
  const screenshotPaths = steps.map(
    (step) => step.annotated_screenshot_url ?? step.screenshot_url
  );

  // Batch resolve signed URLs
  const signedUrls = await resolveScreenshotUrls(
    screenshotPaths,
    "screenshots"
  );

  // Map signed URLs back to steps
  const stepsWithSignedUrls: Step[] = steps.map((step, index) => ({
    ...step,
    // Store resolved URL in the appropriate field
    annotated_screenshot_url: step.annotated_screenshot_url
      ? signedUrls[index]
      : null,
    screenshot_url: !step.annotated_screenshot_url
      ? signedUrls[index]
      : step.screenshot_url,
  }));

  // Also resolve thumbnail URL if exists
  let thumbnailUrl = procedure.thumbnail_url;
  if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
    const [resolvedThumb] = await resolveScreenshotUrls(
      [thumbnailUrl],
      "screenshots"
    );
    thumbnailUrl = resolvedThumb;
  }

  return {
    ...procedure,
    thumbnail_url: thumbnailUrl,
    steps: stepsWithSignedUrls,
  };
}

// ============================================================================
// T007: getPublicProcedure - Public procedure by slug (no auth required)
// ============================================================================

interface PublicProcedureRow {
  id: string;
  title: string;
  description: string | null;
  step_count: number;
  created_at: string;
  steps: Array<{
    order_index: number;
    annotated_screenshot_url: string | null;
    screenshot_url: string | null;
    generated_text: string | null;
    manual_text: string | null;
  }>;
}

export async function getPublicProcedure(
  slug: string
): Promise<PublicProcedure | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("procedures")
    .select(
      `
      id,
      title,
      description,
      step_count,
      created_at,
      steps (
        order_index,
        annotated_screenshot_url,
        screenshot_url,
        action_type,
        element_text,
        element_tag,
        click_x,
        click_y,
        page_url,
        page_title,
        generated_text,
        manual_text,
        captured_at
      )
    `
    )
    .eq("public_slug", slug)
    .eq("is_public", true)
    .order("order_index", { referencedTable: "steps", ascending: true })
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Erro ao carregar procedimento público: ${error.message}`);
  }

  // Type assertion for the data
  const procedureData = data as unknown as PublicProcedureRow;

  // Increment views count (fire and forget)
  void supabase.rpc("increment_procedure_views", { slug } as never);

  // Transform to PublicProcedure format
  const publicProcedure: PublicProcedure = {
    id: procedureData.id,
    title: procedureData.title,
    description: procedureData.description,
    step_count: procedureData.step_count,
    created_at: procedureData.created_at,
    steps: (procedureData.steps ?? []).map((step) => ({
      order_index: step.order_index,
      annotated_screenshot_url:
        step.annotated_screenshot_url ?? step.screenshot_url,
      generated_text: step.generated_text,
      manual_text: step.manual_text,
    })),
  };

  return publicProcedure;
}
