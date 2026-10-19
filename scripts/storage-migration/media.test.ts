// @vitest-environment node
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { audioPreviewArgs, binaryPath, generateArtifacts, makeAudioPreview, probeAudio, runProcess } from "./media";
import { assertFullyVerified, publicUrl, sha256, type Asset, type Manifest } from "./core";
import { verifyAssets } from "./workflow";

const directories: string[] = [];
afterEach(async () => { vi.unstubAllGlobals(); for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true }); });

describe("approved audio recipe", () => {
  it("generates and fully verifies only the public 15s preview while retaining full source locally", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "rapperank-audio-"));
    directories.push(directory);
    const sourceFile = path.join(directory, "source 中文.wav");
    await runProcess(binaryPath("ffmpeg"), ["-nostdin", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=8000", "-t", "46", sourceFile]);
    const bytes = await readFile(sourceFile);
    const asset: Asset = { source: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/audio.wav", targetKey: "music/audio.m4a", kind: "audio", bindings: [], state: "planned", objects: [], sourceSha256: sha256(bytes), version: { etag: "v1", lastModified: null, bytes: bytes.length, mime: "audio/wav" } };
    asset.objects = await generateArtifacts(directory, asset, bytes);
    expect(asset.objects).toHaveLength(1);
    expect(asset.objects[0].role).toBe("audio-preview");
    expect(asset.objects[0].key).toBe("music/audio.m4a");
    expect(asset.sourceFile).toBe(`sources/audio/${sha256(bytes)}.wav`);
    expect(await readFile(path.join(directory, asset.sourceFile!))).toEqual(bytes);
    expect(asset.sourceDuration).toBeGreaterThanOrEqual(45);
    asset.target = publicUrl(asset.objects[0].key);
    asset.state = "copied";
    const preview = await readFile(path.join(directory, asset.objects[0].file));
    const get = vi.fn(async (_key: string, range?: string) => range
      ? { status: 206, bytes: preview.subarray(0, 1024), mime: "audio/mp4", contentRange: `bytes 0-1023/${preview.length}` }
      : { status: 200, bytes: preview, mime: "audio/mp4" });
    const manifest: Manifest = { format: 2, runId: "audio-test", createdAt: "now", snapshot: [], assets: [asset] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { etag: "v1", "content-length": String(bytes.length), "content-type": "audio/wav" } })));
    await verifyAssets(manifest, directory, { get, upload: vi.fn() }, false, vi.fn(), vi.fn());
    expect(get.mock.calls.map(([key]) => key)).toEqual([asset.objects[0].key, asset.objects[0].key]);
    expect(get.mock.calls[1][1]).toBe("bytes=0-1023");
    expect(manifest.verification!.objects[0]).toMatchObject({ codec: "aac", range: true });
    expect(() => assertFullyVerified(manifest)).not.toThrow();
  }, 20_000);

  it("uses argument arrays with 30s seek, 15s output, fades, stereo AAC and faststart", () => {
    const args = audioPreviewArgs("C:/source 中文 (1).mp3", "C:/preview audio.m4a");
    expect(args[args.indexOf("-ss") + 1]).toBe("30");
    expect(args[args.indexOf("-t") + 1]).toBe("15");
    expect(args[args.indexOf("-af") + 1]).toBe("afade=t=in:st=0:d=0.2,afade=t=out:st=14.8:d=0.2");
    for (const [flag, value] of [["-c:a", "aac"], ["-b:a", "128k"], ["-ar", "44100"], ["-ac", "2"], ["-movflags", "+faststart"]]) expect(args[args.indexOf(flag) + 1]).toBe(value);
    expect(args).toContain("C:/source 中文 (1).mp3");
    expect(args.at(-1)).toBe("C:/preview audio.m4a");
  });

  it("refuses sources shorter than 45s before invoking ffmpeg", async () => {
    const run = vi.fn();
    await expect(makeAudioPreview("source", "target", { probe: async () => ({ duration: 44.99, codec: "mp3" }), run, executable: "ffmpeg" })).rejects.toThrow("shorter");
    expect(run).not.toHaveBeenCalled();
  });

  it.each([{ duration: 14.8, codec: "aac" }, { duration: 15, codec: "mp3" }])("rejects an invalid encoded preview", async (preview) => {
    const probe = vi.fn().mockResolvedValueOnce({ duration: 60, codec: "mp3" }).mockResolvedValueOnce(preview);
    await expect(makeAudioPreview("source", "target", { probe, run: vi.fn().mockResolvedValue(""), executable: "ffmpeg" })).rejects.toThrow("15 seconds");
  });

  it("probes codec and format duration through JSON with an explicit audio stream", async () => {
    const run = vi.fn().mockResolvedValue(JSON.stringify({ streams: [{ codec_name: "aac" }], format: { duration: "15.023" } }));
    expect(await probeAudio("a.m4a", run, "ffprobe")).toEqual({ duration: 15.023, codec: "aac" });
    expect(run.mock.calls[0][1]).toContain("a:0");
  });
});

describe("image artifacts", () => {
  it("preserves the readable original and generates four neighboring WebP variants without enlarging", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "rapperank-media-"));
    directories.push(directory);
    const bytes = await sharp({ create: { width: 240, height: 160, channels: 3, background: "red" } }).png().toBuffer();
    const asset: Asset = { source: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/photo.png", targetKey: "rapper/photo.png", kind: "image", bindings: [], state: "planned", objects: [], version: { etag: "v1", lastModified: null, bytes: bytes.length, mime: "image/png" } };
    const objects = await generateArtifacts(directory, asset, bytes);
    expect(objects).toHaveLength(5);
    expect(objects[0].key).toBe("rapper/photo.png");
    expect(await readFile(path.join(directory, objects[0].file))).toEqual(bytes);
    for (const object of objects.slice(1)) {
      const metadata = await sharp(await readFile(path.join(directory, object.file))).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.width).toBe(Math.min(object.width!, 240));
      expect(object.key).toBe(`rapper/thumbs/photo-w${object.width}.webp`);
    }
  });
});
