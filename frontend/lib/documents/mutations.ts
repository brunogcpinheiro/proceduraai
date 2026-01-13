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

/**
 * Generate public slug for document sharing
 */
export async function generateDocumentSlug(documentId: string): Promise<{
  public_slug: string;
  is_public: boolean;
}> {
  const supabase = await createClient();

  // Generate slug using database function
  const { data: slugData, error: slugError } = await supabase.rpc(
    "generate_document_public_slug"
  );

  if (slugError) {
    throw new Error(`Erro ao gerar link: ${slugError.message}`);
  }

  const public_slug = slugData as string;

  // Update document with slug and set public
  const { error: updateError } = await supabase
    .from("sop_documents")
    .update({ public_slug, is_public: true } as never)
    .eq("id", documentId);

  if (updateError) {
    throw new Error(`Erro ao atualizar documento: ${updateError.message}`);
  }

  return { public_slug, is_public: true };
}

/**
 * Toggle document public status
 */
export async function toggleDocumentPublic(
  documentId: string,
  isPublic: boolean
): Promise<void> {
  const supabase = await createClient();

  const updateData = isPublic
    ? { is_public: true }
    : { is_public: false, public_slug: null };

  const { error } = await supabase
    .from("sop_documents")
    .update(updateData as never)
    .eq("id", documentId);

  if (error) {
    throw new Error(`Erro ao atualizar visibilidade: ${error.message}`);
  }
}
