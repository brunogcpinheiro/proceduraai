import { createClient } from "@/lib/supabase/server";

/**
 * Storage utility functions for Supabase signed URLs
 * Used to generate time-limited access URLs for private storage buckets
 */

export type StorageBucket =
  | "screenshots"
  | "annotated"
  | "public_links"
  | "exports";

const DEFAULT_EXPIRATION_SECONDS = 3600; // 1 hour

/**
 * Generate a signed URL for a single file in a private bucket
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string | null> {
  if (!path) return null;

  // Public bucket doesn't need signed URLs
  if (bucket === "public_links") {
    const supabase = await createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error(
      `Error generating signed URL for ${bucket}/${path}:`,
      error.message
    );
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate signed URLs for multiple files in batch
 */
export async function getSignedUrls(
  bucket: StorageBucket,
  paths: string[],
  expiresIn: number = DEFAULT_EXPIRATION_SECONDS
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();

  if (paths.length === 0) return result;

  // Filter out empty paths
  const validPaths = paths.filter((p) => p && p.trim());

  if (validPaths.length === 0) return result;

  // Public bucket handling
  if (bucket === "public_links") {
    const supabase = await createClient();
    for (const path of validPaths) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      result.set(path, data.publicUrl);
    }
    return result;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(validPaths, expiresIn);

  if (error) {
    console.error(`Error generating signed URLs for ${bucket}:`, error.message);
    validPaths.forEach((path) => result.set(path, null));
    return result;
  }

  // Map results back to original paths
  data.forEach((item) => {
    if (item.path) {
      result.set(item.path, item.signedUrl ?? null);
    }
  });

  // Ensure all paths have entries
  validPaths.forEach((path) => {
    if (!result.has(path)) {
      result.set(path, null);
    }
  });

  return result;
}

/**
 * Determine which bucket a screenshot URL belongs to
 * URLs stored in DB are paths like: "{user_id}/{procedure_id}/{filename}.webp"
 */
export function determineBucket(url: string | null): StorageBucket | null {
  if (!url) return null;

  // If it's already a full URL (signed or public), we can't determine bucket
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return null;
  }

  // For internal paths, default to screenshots bucket
  // Annotated screenshots would be stored in 'annotated' bucket
  return "screenshots";
}

/**
 * Resolve screenshot URL to a signed URL
 * Handles both raw and annotated screenshots
 */
export async function resolveScreenshotUrl(
  path: string | null,
  bucket: StorageBucket = "screenshots"
): Promise<string | null> {
  if (!path) return null;

  // Already a full URL (shouldn't happen but handle gracefully)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return getSignedUrl(bucket, path);
}

/**
 * Resolve multiple screenshot URLs efficiently in batch
 */
export async function resolveScreenshotUrls(
  paths: (string | null)[],
  bucket: StorageBucket = "screenshots"
): Promise<(string | null)[]> {
  // Filter valid paths and track their indices
  const validPathsWithIndex: { path: string; index: number }[] = [];

  paths.forEach((path, index) => {
    if (path && !path.startsWith("http://") && !path.startsWith("https://")) {
      validPathsWithIndex.push({ path, index });
    }
  });

  if (validPathsWithIndex.length === 0) {
    return paths.map((p) => {
      if (p && (p.startsWith("http://") || p.startsWith("https://"))) {
        return p;
      }
      return null;
    });
  }

  const signedUrlMap = await getSignedUrls(
    bucket,
    validPathsWithIndex.map((v) => v.path)
  );

  // Build result array
  const result: (string | null)[] = [...paths];

  validPathsWithIndex.forEach(({ path, index }) => {
    result[index] = signedUrlMap.get(path) ?? null;
  });

  // Handle already-full URLs
  paths.forEach((path, index) => {
    if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
      result[index] = path;
    }
  });

  return result;
}
