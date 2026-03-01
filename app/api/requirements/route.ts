import { NextResponse } from "next/server";
import { requirementSchema } from "@/lib/validation/requirementSchema";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";
import type { RequirementType, RequirementPriority, ApprovalWorkflow } from "@/src/generated/prisma/enums";
// Maps form display values to Prisma enum values
const typeMap: Record<string, RequirementType> = {
  "Financial Report": "FINANCIAL_REPORT",
  "Compliance Document": "COMPLIANCE_DOCUMENT",
  "Plan Document": "PLAN_DOCUMENT",
  "Audit Report": "AUDIT_REPORT",
  "Tax Filing": "TAX_FILING",
  "Legal Document": "LEGAL_DOCUMENT",
  "Other": "OTHER",
};

const priorityMap: Record<string, RequirementPriority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const workflowMap: Record<string, ApprovalWorkflow> = {
  "single-reviewer": "SINGLE_REVIEWER",
  "multi-reviewer": "MULTI_REVIEWER",
  sequential: "SEQUENTIAL",
};

/**
 * GET /api/requirements
 * Fetch all requirements created by the authenticated TPA.
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
      { success: false, message: "Only TPA users can access requirements" },
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

    const requirements = await prisma.requirement.findMany({
      where: { tpaId: tpa.id },
      include: {
        plan: {
          select: { id: true, planName: true, planType: true },
        },
        sponsors: {
          include: {
            sponsor: {
              select: {
                id: true,
                organizationName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: requirements });
  } catch (error) {
    console.error("GET /api/requirements error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/requirements
 * Create a new requirement as the authenticated TPA.
 */
export async function POST(req: Request) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role !== "tpa") {
    return NextResponse.json(
      { success: false, message: "Only TPA users can create requirements" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const result = requirementSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const data = result.data;

    const tpa = await prisma.tpa.findUnique({
      where: { userId: user.id },
    });

    if (!tpa) {
      return NextResponse.json(
        { success: false, message: "TPA profile not found" },
        { status: 404 }
      );
    }

    // Verify the plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Verify all assigned sponsors exist and are linked to this TPA
    const tpaSponsors = await prisma.tpaSponsor.findMany({
      where: {
        tpaId: tpa.id,
        sponsorId: { in: data.assignedSponsors },
      },
      select: { sponsorId: true },
    });

    const validSponsorIds = tpaSponsors.map((ts) => ts.sponsorId);
    const invalidSponsors = data.assignedSponsors.filter(
      (id) => !validSponsorIds.includes(id)
    );

    if (invalidSponsors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some sponsors are not linked to your TPA account",
          invalidSponsors,
        },
        { status: 400 }
      );
    }

    // Create requirement + sponsor assignments in a transaction
    const requirement = await prisma.$transaction(async (tx) => {
      const req = await tx.requirement.create({
        data: {
          tpaId: tpa.id,
          planId: data.planId,
          title: data.title,
          description: data.description,
          type: typeMap[data.type] || "OTHER",
          priority: priorityMap[data.priority] || "MEDIUM",
          dueDate: new Date(data.dueDate),
          documentSpecs: data.documentSpecs || null,
          approvalWorkflow: workflowMap[data.approvalWorkflow] || "SINGLE_REVIEWER",
          notifyOnSubmission: data.notifyOnSubmission,
          allowResubmission: data.allowResubmission,
          assignedAt: new Date(),
        },
      });

      // Create RequirementSponsor entries
      await tx.requirementSponsor.createMany({
        data: validSponsorIds.map((sponsorId) => ({
          requirementId: req.id,
          sponsorId,
        })),
      });

      return req;
    });

    return NextResponse.json(
      {
        success: true,
        data: requirement,
        message: "Requirement created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/requirements error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create requirement" },
      { status: 500 }
    );
  }
}
