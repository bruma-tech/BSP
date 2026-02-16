import { NextResponse } from "next/server";
import { commentSchema } from "@/lib/validation/commentSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      const errors = (parsed.error as import("zod").ZodError<any>).issues.map((e) => ({
        field: String(e.path[0]),
        message: e.message,
      }));

      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const saved = {
      id: "CMT-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...parsed.data,
    };

    return NextResponse.json({
      success: true,
      data: saved,
    });

  } catch {
    return NextResponse.json(
      {
        success: false,
        errors: [{ field: "general", message: "Unable to post comment" }],
      },
      { status: 500 }
    );
  }
}
