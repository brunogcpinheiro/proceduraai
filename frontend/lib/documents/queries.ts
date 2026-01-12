import { createClient } from "@/lib/supabase/server";
import type { SOPDocument } from "@/types/database";

interface GenerationCountData {
  generation_count: number;
  generation_reset_at: string;
}

/**
 * Get existing document for a procedure
 */
export async function getDocument(
  procedureId: string
): Promise<SOPDocument | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sop_documents")
    .select("*")
    .eq("procedure_id", procedureId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Erro ao carregar documento: ${error.message}`);
  }

  return data as SOPDocument;
}

/**
 * Get generation count for today
 */
export async function getGenerationCount(procedureId: string): Promise<{
  count: number;
  remaining: number;
  resetDate: string;
}> {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createClient();

  const { data } = await supabase
    .from("sop_documents")
    .select("generation_count, generation_reset_at")
    .eq("procedure_id", procedureId)
    .single();

  if (!data) {
    return { count: 0, remaining: 5, resetDate: today };
  }

  // Cast to expected type
  const docData = data as unknown as GenerationCountData;

  // Check if reset date is today
  if (docData.generation_reset_at === today) {
    return {
      count: docData.generation_count,
      remaining: Math.max(0, 5 - docData.generation_count),
      resetDate: today,
    };
  }

  // Reset happened (new day)
  return { count: 0, remaining: 5, resetDate: today };
}
