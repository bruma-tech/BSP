import { NextResponse } from "next/server";
import { requirementSchema } from "@/lib/validation/requirementSchema";

export async function POST(req: Request) {
  try {
    console.log("\n========== REQUIREMENT API HIT ==========");

    const body = await req.json();
    console.log("Incoming Requirement Data:", body);

    const result = requirementSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      console.log("Requirement Validation Failed");
      console.log(errors);

      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    console.log("Requirement Validation Passed");
    console.log("Clean Requirement Data:", result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Requirement stored (mock)",
    });

  } catch (err) {
    console.log("Requirement API Crash:", err);
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 500 }
    );
  }
}