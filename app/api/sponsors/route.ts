import { NextResponse } from "next/server";
import { sponsorSchema } from "@/lib/validation/sponsorSchema";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = sponsorSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        field: String(e.path[0]),
        message: e.message,
      }));

      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const saved = {
      id: "SPN-" + Date.now(),
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
        errors: [{ field: "general", message: "Server error" }],
      },
      { status: 500 }
    );
  }
}
