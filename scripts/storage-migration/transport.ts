import { createClient } from "@supabase/supabase-js";
import { assertSameVersion, normalizeMime, publicUrl, sha256, type SourceVersion, type StoredObject, type Verification } from "./core";

const REQUEST_TIMEOUT = 60_000;
export const RETRY_DELAYS = [1_000, 2_000, 4_000] as const;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function retry<T>(operation: () => Promise<T>, sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await operation(); } catch (error) {
      const retryable = !(error instanceof HttpError) || error.status === 429 || error.status >= 500;
      if (!retryable || attempt >= RETRY_DELAYS.length) throw error;
      await sleep(RETRY_DELAYS[attempt]);
    }
  }
}

/** Consume the body inside the timeout, so a stalled download is also bounded. */
export async function request(url: string | URL | Request, options: RequestInit = {}): Promise<{ response: Response; bytes: Buffer }> {
  return retry(async () => {
    const signal = options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(REQUEST_TIMEOUT)]) : AbortSignal.timeout(REQUEST_TIMEOUT);
    const response = await fetch(url, { ...options, signal, cache: "no-store", redirect: "error" });
    if (response.status === 429 || response.status >= 500) {
      await response.body?.cancel();
      throw new HttpError(response.status, `HTTP ${response.status}`);
    }
    return { response, bytes: Buffer.from(await response.arrayBuffer()) };
  });
}

export function versionFromHeaders(headers: Headers, length?: number): SourceVersion {
  const declared = headers.get("content-length");
  const bytes = declared === null ? length : Number(declared);
  if (bytes === undefined || !Number.isSafeInteger(bytes) || bytes <= 0) throw new Error("Source did not return a valid content length");
  const version = { etag: headers.get("etag"), lastModified: headers.get("last-modified"), bytes, mime: normalizeMime(headers.get("content-type")) };
  if (!version.etag && !version.lastModified) throw new Error("Source has no version validator; cannot safely migrate");
  return version;
}

export async function headSource(source: string): Promise<SourceVersion> {
  const { response } = await request(source, { method: "HEAD" });
  if (!response.ok) throw new HttpError(response.status, `OSS HEAD failed: HTTP ${response.status}`);
  return versionFromHeaders(response.headers);
}

export async function downloadSource(source: string, version: SourceVersion): Promise<Buffer> {
  const headers = new Headers();
  if (version.etag) headers.set("If-Match", version.etag);
  else if (version.lastModified) headers.set("If-Unmodified-Since", version.lastModified);
  const { response, bytes } = await request(source, { headers });
  if (response.status === 412) throw new Error("OSS source changed since plan; create a new plan");
  if (!response.ok) throw new HttpError(response.status, `OSS GET failed: HTTP ${response.status}`);
  assertSameVersion(version, versionFromHeaders(response.headers, bytes.length));
  if (bytes.length !== version.bytes) throw new Error("OSS download length differs from planned source");
  return bytes;
}

export type PublicObject = { status: number; bytes: Buffer; mime: string; contentRange?: string | null };
export interface ObjectTransport {
  get(key: string, range?: string): Promise<PublicObject>;
  upload(key: string, bytes: Buffer, mime: string): Promise<void>;
}

export function assertUploadKey(key: string, mime: string, role?: StoredObject["role"]): void {
  const name = "[A-Za-z0-9_(). -]+";
  const originalImage = new RegExp(`^(?:(?:rapper|label)/${name}\\.(?:jpg|jpeg|png|webp|gif|avif)|album/art/album \\([1-9][0-9]*\\)\\.jpg)$`);
  const variantImage = new RegExp(`^(?:(?:rapper|label)|album/art)/thumbs/${name}-w(?:128|320|800|1200)\\.webp$`);
  const audioPreview = new RegExp(`^music/${name}\\.m4a$`);
  const unsafe = key.split("/").some((part) => !part || part === "." || part === ".." || part !== part.trim() || part.endsWith("."));
  if (unsafe) throw new Error("Only approved readable target objects may be uploaded");
  if (mime.startsWith("audio/")) {
    if (!audioPreview.test(key) || mime !== "audio/mp4" || (role && role !== "audio-preview")) throw new Error("Full source audio must never be uploaded; only music/*.m4a previews are allowed");
  } else if (!mime.startsWith("image/") || !(originalImage.test(key) || (variantImage.test(key) && mime === "image/webp"))) throw new Error("Only approved readable images and audio previews may be uploaded");
}

/** Supabase's object endpoint may encode a missing key as HTTP 400 + NoSuchKey. */
export function normalizePublicStatus(status: number, bytes: Buffer, mime: string): number {
  if (status !== 400 || normalizeMime(mime) !== "application/json") return status;
  try {
    const body = JSON.parse(bytes.toString("utf8")) as { statusCode?: string | number; code?: string; error?: string };
    if (String(body.statusCode) === "404" && body.code === "NoSuchKey" && body.error === "not_found") return 404;
  } catch { /* An arbitrary 400 must not authorize an upload. */ }
  return status;
}

export function createTransport(): ObjectTransport {
  // Client creation is deferred until a real write is necessary. Plan/verify need no key.
  let admin: ReturnType<typeof createClient> | undefined;
  return {
    async get(key, range) {
      const { response, bytes } = await request(publicUrl(key), { headers: range ? { Range: range } : {} });
      const mime = normalizeMime(response.headers.get("content-type"));
      return { status: normalizePublicStatus(response.status, bytes, mime), bytes, mime, contentRange: response.headers.get("content-range") };
    },
    async upload(key, bytes, mime) {
      assertUploadKey(key, mime);
      if (!admin) {
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required locally for copy");
        admin = createClient("https://tfvzcuksahcofooqqezx.supabase.co", secret, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          global: { fetch: async (input, init) => {
            // The SDK consumes its response; bound upload completion and response body too.
            const result = await request(input, init);
            return new Response(new Uint8Array(result.bytes), { status: result.response.status, statusText: result.response.statusText, headers: result.response.headers });
          } },
        });
      }
      const { error } = await admin.storage.from("rapperank").upload(key, bytes, { contentType: mime, cacheControl: "31536000", upsert: false });
      if (error) throw new HttpError(Number("statusCode" in error ? error.statusCode : 500), "Storage upload failed");
    },
  };
}

export function compareObject(object: StoredObject, actual: PublicObject): Verification {
  if (actual.status !== 200) throw new HttpError(actual.status, `Public object GET failed: HTTP ${actual.status}`);
  if (actual.bytes.length !== object.bytes || sha256(actual.bytes) !== object.sha256 || normalizeMime(actual.mime) !== object.mime) throw new Error(`Object conflict or corrupt content: ${object.key}`);
  return { key: object.key, sha256: object.sha256, bytes: object.bytes, mime: object.mime };
}

/** Only a definitive anonymous 404 permits a create; existing bytes are never overwritten. */
export async function ensureObject(transport: ObjectTransport, object: StoredObject, bytes: Buffer): Promise<"existing" | "uploaded"> {
  assertUploadKey(object.key, object.mime, object.role);
  if (bytes.length !== object.bytes || sha256(bytes) !== object.sha256) throw new Error(`Local artifact hash mismatch: ${object.key}`);
  const existing = await transport.get(object.key);
  if (existing.status === 200) { compareObject(object, existing); return "existing"; }
  if (existing.status !== 404) throw new HttpError(existing.status, `Cannot establish object absence: HTTP ${existing.status}`);
  try { await transport.upload(object.key, bytes, object.mime); } catch (error) {
    // A concurrent run may have won the create. Inspect its bytes instead of overwriting it.
    if (!(error instanceof HttpError) || (error.status !== 409 && error.status !== 400)) throw error;
  }
  compareObject(object, await transport.get(object.key));
  return "uploaded";
}

export function safeError(error: unknown): string {
  let message = error instanceof Error ? error.message : "Unknown migration failure";
  for (const [name, secret] of Object.entries(process.env)) if (/KEY|SECRET|TOKEN|DATABASE_URL/.test(name) && secret && secret.length > 8) message = message.split(secret).join("[REDACTED]");
  return message;
}
