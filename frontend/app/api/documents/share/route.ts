import {
  generateDocumentSlug,
  toggleDocumentPublic,
} from "@/lib/documents/mutations";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/documents/share
 * Handle document sharing operations
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { documentId, action, isPublic } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: doc, error: docError } = await supabase
      .from("sop_documents")
      .select("id, procedure_id, procedures!inner(user_id)")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      );
    }

    // Cast to access nested field
    const docWithProcedure = doc as unknown as {
      procedure_id: string;
      procedures: { user_id: string };
    };

    if (docWithProcedure.procedures.user_id !== user.id) {
      return NextResponse.json(
        { error: "Sem permissão para este documento" },
        { status: 403 }
      );
    }

    switch (action) {
      case "generateSlug": {
        const result = await generateDocumentSlug(documentId);
        return NextResponse.json(result);
      }

      case "togglePublic": {
        if (typeof isPublic !== "boolean") {
          return NextResponse.json(
            { error: "isPublic é obrigatório" },
            { status: 400 }
          );
        }
        await toggleDocumentPublic(documentId, isPublic);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in share endpoint:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
