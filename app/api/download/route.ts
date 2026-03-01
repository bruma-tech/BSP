import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "No URL provided" },
        { status: 400 }
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch file: ${response.status}` },
        { status: 502 }
      );
    }
    console.log(response)
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    // Extract filename from URL and ensure it has the correct extension
    const urlPath = new URL(url).pathname;
    let filename = urlPath.split("/").pop() || "download";

    const MIME_TO_EXT: Record<string, string> = {
      "application/pdf": ".pdf",
      "application/octet-stream": ".pdf",
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/gif": ".gif",
      "image/webp": ".webp",
      "video/mp4": ".mp4",
      "video/webm": ".webm",
      "audio/mpeg": ".mp3",
      "audio/wav": ".wav",
      "text/plain": ".txt",
      "application/zip": ".zip",
    };

    const ext = MIME_TO_EXT[contentType];
    if (ext && !filename.endsWith(ext)) {
      filename += ext;
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, error: "Download failed" },
      { status: 500 }
    );
  }
}
