import { NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";
import { z } from "zod";
import { notifyDocumentApproved, notifyDocumentRejected } from "@/app/lib/notificationService";

const decisionSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  decision: z.enum(["accept", "reject"]),
  comment: z.string().optional(),
});

/**
 * POST /api/reviews/[reviewId]/decision
 * TPA accepts or rejects a document within a review.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (user.role !== "tpa" && user.role !== "user") {
    return NextResponse.json(
      { success: false, message: "Only TPA users can make review decisions" },
      { status: 403 }
    );
  }

  const { reviewId } = await params;

  try {
    const body = await req.json();
    const parsed = decisionSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const { documentId, decision, comment } = parsed.data;

    // Verify review belongs to this TPA
    const tpa = await prisma.tpa.findUnique({
      where: { userId: user.id },
    });

    if (!tpa) {
      return NextResponse.json(
        { success: false, message: "TPA profile not found" },
        { status: 404 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (review.tpaId !== tpa.id) {
      return NextResponse.json(
        { success: false, message: "Not authorized for this review" },
        { status: 403 }
      );
    }

    // Verify document belongs to this review
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.reviewId !== reviewId) {
      return NextResponse.json(
        { success: false, message: "Document not found in this review" },
        { status: 404 }
      );
    }

    const newDocStatus =
      decision === "accept" ? "APPROVED" : "REJECTED";

    // Update document status and optionally add a comment in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: { status: newDocStatus as any },
      });

      // If rejecting, update review status stays IN_REVIEW
      // If accepting, check if all documents in review are approved
      if (decision === "accept") {
        const allDocs = await tx.document.findMany({
          where: { reviewId },
          select: { id: true, status: true },
        });

        const allApproved = allDocs.every(
          (d) => d.id === documentId || d.status === "APPROVED"
        );

        if (allApproved) {
          await tx.review.update({
            where: { id: reviewId },
            data: { status: "CLOSED", closedAt: new Date() },
          });
        }
      }

      // Add comment if provided
      if (comment && comment.trim()) {
        await tx.comment.create({
          data: {
            reviewId,
            authorId: user.id,
            content: comment.trim(),
            isRevisionRequest: decision === "reject",
          },
        });
      }
    });

    const reviewWithContext = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        sponsor: { select: { userId: true } },
        requirement: { select: { title: true } },
      },
    });
    
    if (reviewWithContext) {
      const notify = decision === "accept" ? notifyDocumentApproved : notifyDocumentRejected;
      notify(
        reviewWithContext.sponsor.userId,
        reviewWithContext.requirement.title,
        document.fileName
      ).catch((err) => console.error("notify decision failed:", err));
    }

    return NextResponse.json({
      success: true,
      message: `Document ${decision === "accept" ? "approved" : "rejected"} successfully`,
      data: { documentId, decision, newStatus: newDocStatus },
    });
  } catch (error) {
    console.error("POST /api/reviews/[reviewId]/decision error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process review decision" },
      { status: 500 }
    );
  }
}
