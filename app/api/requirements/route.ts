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
  try{

    if (user.role === "tpa") {
      const tpa = await prisma.tpa.findUnique({ where: { userId: user.id } });

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
  }

  if (user.role === "sponsor") {
    const sponsor = await prisma.sponsor.findUnique({ where: { userId: user.id } });

    if (!sponsor) {
      return NextResponse.json(
        { success: false, message: "Sponsor profile not found" },
        { status: 404 }
      );
    }

    const now = new Date();

    const requirementSponsors = await prisma.requirementSponsor.findMany({
      where: { sponsorId: sponsor.id },
      include: {
        requirement: {
          include: {
            plan: { select: { id: true, planName: true, planType: true } },
            tpa: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { requirement: { dueDate: "asc" } },
    });

    const requirements = requirementSponsors.map(({ requirement: r }) => {
      const isOverdue =
        r.dueDate &&
        new Date(r.dueDate) < now &&
        r.status !== "COMPLETED" &&
        r.status !== "CLOSED";

      return {
        id: r.id,
        title: r.title,
        description: r.description ?? "",
        type: r.type,
        priority: r.priority.toLowerCase() as "high" | "medium" | "low",
        status: isOverdue ? "overdue" : mapStatus(r.status),
        dueDate: r.dueDate
          ? r.dueDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
          : null,
        dueDateRaw: r.dueDate ?? null,
        documentType: formatType(r.type),
        planName: r.plan?.planName ?? null,
        tpaName: r.tpa?.user?.name ?? null,
        allowResubmission: r.allowResubmission,
      };
    });

    return NextResponse.json({ success: true, data: requirements });
  }

  return NextResponse.json(
    { success: false, message: "Unauthorized role" },
    { status: 403 }
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to fetch requirements";
  console.error("GET /api/requirements error:", error);
  return NextResponse.json(
    { success: false, message },
    { status: 500 }
  );
}
}
function mapStatus(status: string): "pending" | "submitted" | "approved" | "rejected" | "overdue" {
const map: Record<string, "pending" | "submitted" | "approved" | "rejected" | "overdue"> = {
  OPEN: "pending",
  IN_PROGRESS: "submitted",
  COMPLETED: "approved",
  OVERDUE: "overdue",
  CLOSED: "approved",
};
return map[status] ?? "pending";
}

function formatType(type: string) {
return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
