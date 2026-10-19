// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { sha256, type StoredObject } from "./core";
import { assertUploadKey, downloadSource, ensureObject, HttpError, normalizePublicStatus, retry, type ObjectTransport } from "./transport";

afterEach(() => vi.unstubAllGlobals());
const bytes = Buffer.from("hello");
const object: StoredObject = { key: "rapper/photo.jpg", sha256: sha256(bytes), bytes: bytes.length, mime: "image/jpeg", file: "objects/rapper/photo.jpg", role: "original" };
const present = { status: 200, bytes, mime: "image/jpeg" };

describe("immutable object copy", () => {
  it("accepts approved readable folders and rejects hashes, source audio, or unexpected paths", () => {
    for (const key of ["rapper/farao.jpg", "label/GOSH.jpg", "album/art/album (25).jpg", "rapper/thumbs/PSY P-w128.webp", "album/art/thumbs/album (25)-w1200.webp"]) expect(() => assertUploadKey(key, key.endsWith("webp") ? "image/webp" : "image/jpeg")).not.toThrow();
    expect(() => assertUploadKey("music/lv-xing.m4a", "audio/mp4", "audio-preview")).not.toThrow();
    for (const key of ["originals/images/hash.jpg", "derived/v1/hash/w128.webp", "rapper/../photo.jpg", "music/source.mp3"]) expect(() => assertUploadKey(key, key.endsWith("mp3") ? "audio/mpeg" : "image/jpeg")).toThrow();
    expect(() => assertUploadKey("music/song.m4a", "audio/mp4", "original")).toThrow("never be uploaded");
  });
  it("recognizes only Supabase's exact NoSuchKey 400 response as absence", () => {
    const bytes = Buffer.from(JSON.stringify({ statusCode: "404", error: "not_found", message: "Object not found", code: "NoSuchKey" }));
    expect(normalizePublicStatus(400, bytes, "application/json; charset=utf-8")).toBe(404);
    expect(normalizePublicStatus(400, Buffer.from('{"statusCode":"404","error":"not_found"}'), "application/json")).toBe(400);
    expect(normalizePublicStatus(400, bytes, "text/html")).toBe(400);
    expect(normalizePublicStatus(403, bytes, "application/json")).toBe(403);
    expect(normalizePublicStatus(400, Buffer.from("invalid JSON"), "application/json")).toBe(400);
  });
  it("resumes existing identical objects without invoking upload", async () => {
    const transport: ObjectTransport = { get: vi.fn().mockResolvedValue(present), upload: vi.fn() };
    await expect(ensureObject(transport, object, bytes)).resolves.toBe("existing");
    expect(transport.upload).not.toHaveBeenCalled();
  });

  it("only uploads after a 404 and checks newly public bytes", async () => {
    const transport: ObjectTransport = { get: vi.fn().mockResolvedValueOnce({ status: 404, bytes: Buffer.alloc(0), mime: "" }).mockResolvedValueOnce(present), upload: vi.fn() };
    await expect(ensureObject(transport, object, bytes)).resolves.toBe("uploaded");
    expect(transport.upload).toHaveBeenCalledWith(object.key, bytes, "image/jpeg");
    expect(transport.get).toHaveBeenCalledTimes(2);
  });

  it.each([403, 500])("never treats HTTP %s as absence", async (status) => {
    const transport: ObjectTransport = { get: vi.fn().mockResolvedValue({ ...present, status }), upload: vi.fn() };
    await expect(ensureObject(transport, object, bytes)).rejects.toThrow("absence");
    expect(transport.upload).not.toHaveBeenCalled();
  });

  it.each([{ ...present, bytes: Buffer.from("wrong") }, { ...present, mime: "image/png" }])("rejects conflicting existing data or MIME without overwriting", async (actual) => {
    const transport: ObjectTransport = { get: vi.fn().mockResolvedValue(actual), upload: vi.fn() };
    await expect(ensureObject(transport, object, bytes)).rejects.toThrow("conflict");
    expect(transport.upload).not.toHaveBeenCalled();
  });

  it("checks the concurrent winner after an upsert:false create conflict", async () => {
    const transport: ObjectTransport = { get: vi.fn().mockResolvedValueOnce({ ...present, status: 404 }).mockResolvedValueOnce(present), upload: vi.fn().mockRejectedValue(new HttpError(409, "already exists")) };
    await expect(ensureObject(transport, object, bytes)).resolves.toBe("uploaded");
  });
});

describe("network and source version safety", () => {
  it("retries network, 429 and 5xx using bounded 1/2/4 second delays", async () => {
    const operation = vi.fn().mockRejectedValueOnce(new TypeError("network")).mockRejectedValueOnce(new HttpError(429, "rate")).mockRejectedValueOnce(new HttpError(503, "busy")).mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(retry(operation, sleep)).resolves.toBe("ok");
    expect(sleep.mock.calls.flat()).toEqual([1000, 2000, 4000]);
    const denied = vi.fn().mockRejectedValue(new HttpError(403, "forbidden"));
    await expect(retry(denied, sleep)).rejects.toThrow("forbidden");
    expect(denied).toHaveBeenCalledTimes(1);
  });

  it("uses If-Match, downloads raw originals, and rejects version races", async () => {
    const source = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/image.jpg";
    const version = { etag: '"old"', lastModified: null, bytes: 5, mime: "image/jpeg" };
    const fetchMock = vi.fn().mockResolvedValue(new Response(bytes, { status: 200, headers: { ETag: '"new"', "content-length": "5", "content-type": "image/jpeg" } }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(downloadSource(source, version)).rejects.toThrow("source changed");
    expect(fetchMock.mock.calls[0][0]).toBe(source);
    expect((fetchMock.mock.calls[0][1].headers as Headers).get("If-Match")).toBe('"old"');
  });

  it("refuses a failed precondition rather than copying a new source version", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 412 })));
    await expect(downloadSource("https://rapperank.oss-cn-hangzhou.aliyuncs.com/image.jpg", { etag: "v1", lastModified: null, bytes: 5, mime: "image/jpeg" })).rejects.toThrow("source changed");
  });
});
