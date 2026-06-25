import { NextResponse } from "next/server";

// Force Node.js runtime (required for child_process / yt-dlp-exec)
export const runtime = "nodejs";

// ─── Lazy-load yt-dlp-exec (ESM package) ─────────────────────────────────

let _ytDlp = null;
async function getYtDlp() {
  if (!_ytDlp) {
    const mod = await import("yt-dlp-exec");
    _ytDlp = mod.default ?? mod;
  }
  return _ytDlp;
}

// ─── Format selection ─────────────────────────────────────────────────────

/**
 * Build a yt-dlp format string.
 * We prefer single-file combined MP4 streams so the browser can download
 * one file without needing ffmpeg on the client side.
 */
function buildFormat(videoQuality, isAudioOnly) {
  if (isAudioOnly) {
    return "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio";
  }
  const h = videoQuality === "max" ? "" : `[height<=${videoQuality}]`;
  return [
    `best${h}[ext=mp4]`,           // single-file mp4 (preferred)
    `best${h}[ext=webm]`,           // single-file webm
    `bestvideo${h}[ext=mp4]+bestaudio[ext=m4a]`, // merged (yt-dlp auto-merges if ffmpeg present)
    `best${h}`,                     // any single-file
    "best",                         // absolute fallback
  ].join("/");
}

/**
 * Sanitise a filename to be safe for Content-Disposition headers.
 */
function safeFilename(title, ext) {
  const safe = (title ?? "video").replace(/[^\w\s\-().]/g, "").trim().slice(0, 120);
  return `${safe}.${ext || "mp4"}`;
}

// ─── Error helpers ────────────────────────────────────────────────────────

function userFriendlyError(rawMsg = "") {
  const m = rawMsg.toLowerCase();
  if (m.includes("unsupported url") || m.includes("is not a valid url"))
    return "This URL is not supported. Please paste a direct video link from a supported platform.";
  if (m.includes("private video") || m.includes("private"))
    return "This video is private and cannot be downloaded.";
  if (m.includes("members only") || m.includes("members-only"))
    return "This video is for members only.";
  if (m.includes("not available") || m.includes("unavailable"))
    return "This video is unavailable or has been removed.";
  if (m.includes("sign in") || m.includes("login"))
    return "This video requires a login to access.";
  if (m.includes("age") || m.includes("restricted"))
    return "This video has age restrictions and cannot be downloaded.";
  if (m.includes("live event") || m.includes("is live") || m.includes("live stream"))
    return "Live streams cannot be downloaded. Try again after the stream ends.";
  if (m.includes("copyright") || m.includes("removed"))
    return "This video has been removed or is blocked due to copyright.";
  if (m.includes("too many") || m.includes("rate"))
    return "Rate limited. Please wait a moment and try again.";
  if (m.includes("timed out") || m.includes("timeout"))
    return "The request timed out. Check your connection and try again.";
  return null; // fall through to generic
}

// ─── Route handler ────────────────────────────────────────────────────────

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    url,
    videoQuality = "1080",
    audioFormat = "m4a",
    isAudioOnly = false,
  } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "A valid video URL is required." }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return NextResponse.json(
      { error: "Invalid URL. Please enter a complete URL starting with https://" },
      { status: 400 }
    );
  }

  try {
    const ytDlp = await getYtDlp();
    const format = buildFormat(videoQuality, isAudioOnly);

    // Fetch video metadata + selected format info
    const info = await ytDlp(parsedUrl.href, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: isAudioOnly,
      format,
      // Helps avoid bot-detection on some platforms
      addHeader: [
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      ],
    });

    // ── Case 1: single-stream URL ─────────────────────────────────────────
    if (info.url) {
      return NextResponse.json({
        status: "redirect",
        url: info.url,
        filename: safeFilename(info.title, info.ext),
        title: info.title ?? null,
        thumbnail: info.thumbnail ?? null,
        duration: info.duration ?? null,
        extractor: info.extractor ?? null,
      });
    }

    // ── Case 2: merged format (video stream + audio stream separately) ────
    if (info.requested_formats?.length) {
      const videoStream = info.requested_formats.find((f) => f.vcodec && f.vcodec !== "none" && f.url);
      const audioStream = info.requested_formats.find((f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none") && f.url);

      const picker = [
        videoStream && {
          url: videoStream.url,
          type: "video",
          ext: videoStream.ext ?? "mp4",
          height: videoStream.height ?? null,
          label: videoStream.height ? `Video ${videoStream.height}p` : "Video Stream",
        },
        audioStream && {
          url: audioStream.url,
          type: "audio",
          ext: audioStream.ext ?? "m4a",
          label: "Audio Stream",
        },
      ].filter(Boolean);

      return NextResponse.json({
        status: "picker",
        picker,
        title: info.title ?? null,
        thumbnail: info.thumbnail ?? null,
        duration: info.duration ?? null,
        extractor: info.extractor ?? null,
        note: "This video uses separate video and audio streams. Download both and merge with a tool like FFmpeg, or use the audio-only option to get a single file.",
      });
    }

    // ── Case 3: formats array (pick best) ────────────────────────────────
    if (info.formats?.length) {
      const usable = info.formats
        .filter((f) => f.url && f.url.startsWith("http"))
        .sort((a, b) => (b.filesize ?? b.tbr ?? 0) - (a.filesize ?? a.tbr ?? 0));

      if (usable.length) {
        const best = usable[0];
        return NextResponse.json({
          status: "redirect",
          url: best.url,
          filename: safeFilename(info.title, best.ext),
          title: info.title ?? null,
          thumbnail: info.thumbnail ?? null,
          duration: info.duration ?? null,
          extractor: info.extractor ?? null,
        });
      }
    }

    return NextResponse.json(
      { error: "Could not extract a download URL from this video. It may use DRM protection." },
      { status: 422 }
    );
  } catch (err) {
    const rawMsg = (err?.stderr || err?.message || "").toString();
    const friendly = userFriendlyError(rawMsg);
    console.error("[video-downloader] yt-dlp error:", rawMsg.slice(0, 500));

    return NextResponse.json(
      { error: friendly || "Failed to process this video. Please check the URL and try again." },
      { status: 500 }
    );
  }
}
