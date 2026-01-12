import { createClient } from "@/lib/supabase/server";
import type { SOPDocument, SOPDocumentContent } from "@/types/database";

interface UpdateDocumentData {
  content: SOPDocumentContent;
  version: number;
  last_edited_at: string;
}

/**
 * Update document content (for editing)
 */
export async function updateDocument(
  documentId: string,
  content: SOPDocumentContent
): Promise<SOPDocument> {
  const supabase = await createClient();

  const updateData: UpdateDocumentData = {
    content,
    version: content.version,
    last_edited_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sop_documents")
    .update(updateData as never)
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar documento: ${error.message}`);
  }

  return data as SOPDocument;
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sop_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(`Erro ao excluir documento: ${error.message}`);
  }
}
