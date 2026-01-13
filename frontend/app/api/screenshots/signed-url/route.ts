import { getCurrentUser } from "@/lib/supabase/server";
import { getSignedUrls, StorageBucket } from "@/lib/supabase/storage";
import { NextRequest, NextResponse } from "next/server";

interface SignedUrlRequest {
  bucket: StorageBucket;
  paths: string[];
  expiresIn?: number;
}

/**
 * POST /api/screenshots/signed-url
 * Generate signed URLs for screenshot paths
 *
 * Request body:
 * {
 *   bucket: 'screenshots' | 'annotated' | 'public' | 'exports',
 *   paths: string[],
 *   expiresIn?: number (seconds, default 3600)
 * }
 *
 * Response:
 * {
 *   urls: { [path: string]: string | null }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as SignedUrlRequest;

    if (!body.bucket || !body.paths || !Array.isArray(body.paths)) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    // Validate bucket
    const validBuckets: StorageBucket[] = [
      "screenshots",
      "annotated",
      "public_links",
      "exports",
    ];
    if (!validBuckets.includes(body.bucket)) {
      return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
    }

    // Limit number of paths per request
    if (body.paths.length > 100) {
      return NextResponse.json(
        { error: "Máximo de 100 paths por requisição" },
        { status: 400 }
      );
    }

    // Security: Verify paths belong to the user
    const userIdPrefix = user.id;
    const validPaths = body.paths.filter((path) => {
      if (!path) return false;
      // Paths should start with user's ID for security
      return path.startsWith(userIdPrefix) || body.bucket === "public_links";
    });

    const signedUrlMap = await getSignedUrls(
      body.bucket,
      validPaths,
      body.expiresIn
    );

    // Convert Map to object for JSON response
    const urls: Record<string, string | null> = {};
    signedUrlMap.forEach((url, path) => {
      urls[path] = url;
    });

    // Mark paths that were filtered out due to security as null
    body.paths.forEach((path) => {
      if (!(path in urls)) {
        urls[path] = null;
      }
    });

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error generating signed URLs:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar URLs assinadas" },
      { status: 500 }
    );
  }
}
