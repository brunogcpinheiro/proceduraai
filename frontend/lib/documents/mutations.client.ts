"use client";

/**
 * Client-side mutations for SOP documents
 */

interface GenerateSlugResponse {
  public_slug: string;
  is_public: boolean;
}

/**
 * Generate public slug for document (client-side)
 */
export async function generateDocumentSlugClient(
  documentId: string
): Promise<GenerateSlugResponse> {
  const response = await fetch("/api/documents/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, action: "generateSlug" }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao gerar link público");
  }

  return data;
}

/**
 * Toggle document public status (client-side)
 */
export async function toggleDocumentPublicClient(
  documentId: string,
  isPublic: boolean
): Promise<void> {
  const response = await fetch("/api/documents/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, action: "togglePublic", isPublic }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao atualizar visibilidade");
  }
}
