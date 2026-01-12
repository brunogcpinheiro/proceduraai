import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { SOPDocumentContent } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface Step {
  order_index: number;
  action_type: string;
  element_text: string | null;
  page_title: string | null;
  page_url: string;
  generated_text: string | null;
  manual_text: string | null;
  screenshot_url: string | null;
  annotated_screenshot_url: string | null;
}

interface Procedure {
  id: string;
  title: string;
  description: string | null;
  steps: Step[];
}

const SYSTEM_PROMPT = `Você é um especialista em criar documentações de procedimentos operacionais padrão (SOP).
Sua tarefa é transformar uma sequência de passos gravados automaticamente em um documento SOP profissional e bem estruturado.

O documento deve ser escrito em português brasileiro formal, mas acessível.

Para cada passo, você receberá:
- Tipo de ação (click, input, navigate, scroll, select)
- Texto do elemento clicado (se houver)
- Título e URL da página
- Descrição gerada ou manual (se houver)

Você deve retornar um JSON válido com a seguinte estrutura:
{
  "purpose": "Descrição clara do objetivo deste procedimento",
  "prerequisites": ["lista", "de", "pré-requisitos"],
  "steps": [
    {
      "title": "Título curto do passo",
      "description": "Descrição detalhada do que fazer neste passo",
      "notes": "Observações adicionais (opcional)"
    }
  ],
  "conclusion": "Resumo do que foi realizado e próximos passos"
}

Diretrizes:
- Use linguagem clara e direta
- Cada passo deve ter instruções acionáveis
- Inclua dicas e observações quando útil
- Infira pré-requisitos com base nas páginas acessadas
- A conclusão deve resumir o que foi alcançado`;

/**
 * POST /api/documents/generate
 * Generate SOP document using OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey || openaiApiKey === "your-openai-api-key") {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    const { procedureId } = await request.json();

    if (!procedureId) {
      return NextResponse.json(
        { error: "procedureId é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get procedure with steps
    const { data: procedureData, error: procError } = await supabase
      .from("procedures")
      .select(
        `
        id,
        title,
        description,
        user_id,
        steps (
          order_index,
          action_type,
          element_text,
          page_title,
          page_url,
          generated_text,
          manual_text,
          screenshot_url,
          annotated_screenshot_url
        )
      `
      )
      .eq("id", procedureId)
      .eq("user_id", user.id)
      .order("order_index", { referencedTable: "steps", ascending: true })
      .single();

    if (procError || !procedureData) {
      return NextResponse.json(
        { error: "Procedimento não encontrado" },
        { status: 404 }
      );
    }

    const procedure = procedureData as unknown as Procedure;

    if (!procedure.steps || procedure.steps.length === 0) {
      return NextResponse.json(
        { error: "Procedimento não possui passos" },
        { status: 400 }
      );
    }

    // Check rate limit
    const today = new Date().toISOString().split("T")[0];
    const { data: existingDoc } = await supabase
      .from("sop_documents")
      .select("id, generation_count, generation_reset_at, version")
      .eq("procedure_id", procedureId)
      .single();

    let generationCount = 0;
    let version = 1;

    if (existingDoc) {
      const docData = existingDoc as unknown as {
        generation_count: number;
        generation_reset_at: string;
        version: number;
      };

      if (docData.generation_reset_at === today) {
        generationCount = docData.generation_count;
        if (generationCount >= 5) {
          return NextResponse.json(
            {
              error: "Limite diário de gerações atingido (5/dia)",
              remaining: 0,
            },
            { status: 429 }
          );
        }
      }
      version = docData.version + 1;
    }

    // Format steps for OpenAI
    const stepsContext = procedure.steps.map((step, i) => ({
      step: i + 1,
      action: step.action_type,
      element: step.element_text || "(não especificado)",
      page: step.page_title || step.page_url,
      description: step.manual_text || step.generated_text || "(sem descrição)",
    }));

    // Call OpenAI
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Título do procedimento: ${procedure.title}
${procedure.description ? `Descrição: ${procedure.description}` : ""}

Passos gravados:
${JSON.stringify(stepsContext, null, 2)}

Gere o documento SOP em formato JSON.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedContent = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Build full document content
    const documentContent: SOPDocumentContent = {
      title: procedure.title,
      generatedAt: new Date().toISOString(),
      version,
      sections: {
        purpose: {
          title: "Objetivo",
          content:
            generatedContent.purpose || "Procedimento operacional padrão.",
        },
        prerequisites: {
          title: "Pré-requisitos",
          items: generatedContent.prerequisites || [],
        },
        steps: (generatedContent.steps || []).map(
          (
            step: { title: string; description: string; notes?: string },
            i: number
          ) => ({
            number: i + 1,
            title: step.title || `Passo ${i + 1}`,
            description: step.description || "",
            screenshotUrl:
              procedure.steps[i]?.annotated_screenshot_url ||
              procedure.steps[i]?.screenshot_url ||
              null,
            notes: step.notes,
          })
        ),
        conclusion: {
          title: "Conclusão",
          content:
            generatedContent.conclusion ||
            "Procedimento concluído com sucesso.",
        },
      },
    };

    // Upsert document
    const { data: savedDoc, error: saveError } = await supabase
      .from("sop_documents")
      .upsert(
        {
          procedure_id: procedureId,
          content: documentContent,
          version,
          generation_count: generationCount + 1,
          generation_reset_at: today,
          generated_at: new Date().toISOString(),
        } as never,
        { onConflict: "procedure_id" }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Error saving document:", saveError);
      return NextResponse.json(
        { error: "Erro ao salvar documento" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      document: savedDoc,
      remaining: 5 - (generationCount + 1),
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao gerar documento",
      },
      { status: 500 }
    );
  }
}
