import { getDocument, getGenerationCount } from "@/lib/documents/queries";
import { getCurrentUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ procedureId: string }>;
}

/**
 * GET /api/documents/[procedureId]
 * Get document for a procedure
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { procedureId } = await params;

    const document = await getDocument(procedureId);
    const generationInfo = await getGenerationCount(procedureId);

    return NextResponse.json({
      document,
      generationInfo,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Erro ao carregar documento" },
      { status: 500 }
    );
  }
}
