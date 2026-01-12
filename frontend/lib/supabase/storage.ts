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
 * Extract the relative path from a full Supabase storage URL
 * Handles both public and signed URL formats
 * Example: https://xxx.supabase.co/storage/v1/object/public/screenshots/user_id/proc_id/file.png
 * Returns: user_id/proc_id/file.png
 */
export function extractPathFromFullUrl(
  url: string,
  bucket: StorageBucket = "screenshots"
): string | null {
  if (!url) return null;

  // Match patterns like:
  // /storage/v1/object/public/{bucket}/...
  // /storage/v1/object/sign/{bucket}/...
  const patterns = [
    new RegExp(`/storage/v1/object/public/${bucket}/(.+?)(?:\\?|$)`),
    new RegExp(`/storage/v1/object/sign/${bucket}/(.+?)(?:\\?|$)`),
    // Also handle direct path after bucket name in URL
    new RegExp(
      `supabase\\.co/storage/v1/object/(?:public|sign)/${bucket}/(.+?)(?:\\?|$)`
    ),
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Decode URL-encoded characters
      return decodeURIComponent(match[1]);
    }
  }

  return null;
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
 * Now also handles full URLs by extracting the path and generating signed URLs
 */
export async function resolveScreenshotUrl(
  path: string | null,
  bucket: StorageBucket = "screenshots"
): Promise<string | null> {
  if (!path) return null;

  let actualPath = path;

  // If it's a full URL, extract the path
  if (path.startsWith("http://") || path.startsWith("https://")) {
    const extractedPath = extractPathFromFullUrl(path, bucket);
    if (extractedPath) {
      actualPath = extractedPath;
    } else {
      // Could not extract path, return null (or you could return original URL)
      console.warn(`Could not extract path from URL: ${path}`);
      return null;
    }
  }

  return getSignedUrl(bucket, actualPath);
}

/**
 * Resolve multiple screenshot URLs efficiently in batch
 * Now also handles full URLs by extracting paths and generating signed URLs
 */
export async function resolveScreenshotUrls(
  paths: (string | null)[],
  bucket: StorageBucket = "screenshots"
): Promise<(string | null)[]> {
  // Process paths: extract actual paths from full URLs
  const processedPaths: { originalIndex: number; path: string }[] = [];

  paths.forEach((path, index) => {
    if (!path) return;

    let actualPath = path;

    // If it's a full URL, try to extract the path
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const extractedPath = extractPathFromFullUrl(path, bucket);
      if (extractedPath) {
        actualPath = extractedPath;
      } else {
        // Could not extract, skip this path
        console.warn(`Could not extract path from URL: ${path}`);
        return;
      }
    }

    processedPaths.push({ originalIndex: index, path: actualPath });
  });

  if (processedPaths.length === 0) {
    return paths.map(() => null);
  }

  const signedUrlMap = await getSignedUrls(
    bucket,
    processedPaths.map((v) => v.path)
  );

  // Build result array
  const result: (string | null)[] = paths.map(() => null);

  processedPaths.forEach(({ path, originalIndex }) => {
    result[originalIndex] = signedUrlMap.get(path) ?? null;
  });

  return result;
}
