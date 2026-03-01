import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: 'dyott1tnq', 
  api_key: '814937458586388', 
  api_secret: 'bCqQF6R9rl9vTeO5nVoZCpS2oMk'
});

const MIME_TO_RESOURCE: Record<string, string> = {
  image: "image",
  video: "video",
  audio: "video",
  pdf: "raw",
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const mimeType = file.type || "";
    const isPdf = mimeType === "application/pdf";
    const category = isPdf ? "pdf" : mimeType.split("/")[0];
    const resourceType = MIME_TO_RESOURCE[category] || "raw";

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType as "image" | "video" | "raw" | "auto",
          folder: "bruma-uploads",
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as Record<string, unknown>);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        original_filename: result.original_filename,
        created_at: result.created_at,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
