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
            plans: { where: { status: "ACTIVE" }, select: { id: true } },
            requirementSponsors: {
              include: {
                requirement: { select: { status: true } },
              },
          },
        },
      },
    },
    });

    const sponsors = tpaSponsors.map((ts) => {
      const s = ts.sponsor;
      const activeRequirements = s.requirementSponsors.filter(
        (rs) => rs.requirement.status === "OPEN" || rs.requirement.status === "IN_PROGRESS"
      ).length;

      return {
        id: s.id,
        name: s.organizationName,
        status: s.status.toLowerCase() as "active" | "pending" | "inactive" | "suspended",
        planCount: s.plans.length,
        activeRequirements,
        pendingItems: activeRequirements,
        lastActivity: s.updatedAt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        registrationDate: s.createdAt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        contactEmail: s.user.email,
        contactPhone: s.contactNumber,
        address: s.address,
        completionRate: 0,
      };
    });

    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    console.error("GET /api/sponsors error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch sponsors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = sponsorSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({ field: err.path[0], message: err.message }));
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data, message: "Sponsor stored successfully (mock)" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 500 });
  }
}