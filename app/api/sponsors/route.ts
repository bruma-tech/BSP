import { NextResponse } from "next/server";
import { sponsorSchema } from "@/lib/validation/sponsorSchema";

export async function POST(req: Request) {
  try {
    console.log("\n========== SPONSOR API HIT ==========");
    const body = await req.json();
    console.log("RAW BODY TYPE:", typeof body);
    console.log("RAW BODY:", body);
    console.log("FIELDS:", Object.keys(body));
    
    const result = sponsorSchema.safeParse(body);
    if (!result.success) {
      console.log("Sponsor Validation Failed");

      const errors = result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      console.log(errors);

      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }
    console.log("Sponsor Validation Passed");
    console.log("Clean Sponsor:", result.data);

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Sponsor stored successfully (mock)",
    });

  } catch (error) {
    console.log("Server Error:", error);

    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 500 }
    );
  }
}