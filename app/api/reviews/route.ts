import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

/**
 * GET /api/reviews?requirementId=X
 * Fetch reviews for a requirement.
 * TPA: sees all reviews for their requirements.
 * Sponsor: sees only their own reviews.
 */
export async function GET(req: NextRequest) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const requirementId = req.nextUrl.searchParams.get("requirementId");

  if (!requirementId) {
    return NextResponse.json(
      { success: false, message: "requirementId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    if (user.role === "tpa" || user.role === "user") {
      const tpa = await prisma.tpa.findUnique({
        where: { userId: user.id },
      });

      if (!tpa) {
        return NextResponse.json(
          { success: false, message: "TPA profile not found" },
          { status: 404 }
        );
      }

      const reviews = await prisma.review.findMany({
        where: {
          requirementId,
          tpaId: tpa.id,
        },
        include: {
          sponsor: {
            select: { id: true, organizationName: true },
          },
          requirement: {
            select: { id: true, title: true, type: true, priority: true, dueDate: true, status: true },
          },
          documents: {
            orderBy: { version: "desc" },
            include: {
              uploadedBy: { select: { id: true, name: true } },
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { id: true, name: true, role: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: reviews });
    }

    if (user.role === "sponsor") {
      const sponsor = await prisma.sponsor.findUnique({
        where: { userId: user.id },
      });

      if (!sponsor) {
        return NextResponse.json(
          { success: false, message: "Sponsor profile not found" },
          { status: 404 }
        );
      }

      const reviews = await prisma.review.findMany({
        where: {
          requirementId,
          sponsorId: sponsor.id,
        },
        include: {
          sponsor: {
            select: { id: true, organizationName: true },
          },
          requirement: {
            select: { id: true, title: true, type: true, priority: true, dueDate: true, status: true },
          },
          documents: {
            orderBy: { version: "desc" },
            include: {
              uploadedBy: { select: { id: true, name: true } },
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { id: true, name: true, role: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: reviews });
    }

    return NextResponse.json(
      { success: false, message: "Invalid role" },
      { status: 403 }
    );
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
