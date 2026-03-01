import { NextResponse } from "next/server";
import { sponsorSchema } from "@/lib/validation/sponsorSchema";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

/**
 * GET /api/sponsors
 * Fetch all sponsors linked to the authenticated TPA.
 */
export async function GET() {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role !== "tpa") {
    return NextResponse.json(
      { success: false, message: "Only TPA users can access sponsors" },
      { status: 403 }
    );
  }

  try {
    const tpa = await prisma.tpa.findUnique({
      where: { userId: user.id },
    });

    if (!tpa) {
      return NextResponse.json(
        { success: false, message: "TPA profile not found" },
        { status: 404 }
      );
    }

    const tpaSponsors = await prisma.tpaSponsor.findMany({
      where: { tpaId: tpa.id },
      include: {
        sponsor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    const sponsors = tpaSponsors.map((ts) => ({
      id: ts.sponsor.id,
      name: ts.sponsor.organizationName,
      email: ts.sponsor.user.email,
    }));

    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error("GET /api/sponsors error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}

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