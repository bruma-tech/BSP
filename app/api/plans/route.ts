import { NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

/**
 * GET /api/plans
 * Fetch all plans belonging to sponsors linked to the authenticated TPA.
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
      { success: false, message: "Only TPA users can access plans" },
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

    // Get all sponsor IDs linked to this TPA
    const tpaSponsors = await prisma.tpaSponsor.findMany({
      where: { tpaId: tpa.id },
      select: { sponsorId: true },
    });

    const sponsorIds = tpaSponsors.map((ts) => ts.sponsorId);

    // Fetch active plans belonging to those sponsors
    const plans = await prisma.plan.findMany({
      where: {
        sponsorId: { in: sponsorIds },
        status: "ACTIVE",
      },
      select: {
        id: true,
        planName: true,
        planType: true,
      },
      orderBy: { planName: "asc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error("GET /api/plans error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
