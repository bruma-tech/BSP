import { NextResponse } from "next/server";
import { commentSchema } from "@/lib/validation/commentSchema";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

/**
 * POST /api/comments
 * Create a new comment on a review or requirement.
 */
export async function POST(req: Request) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path[0],
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const { content, isRevisionRequest, reviewId, requirementId } = parsed.data;

    if (!reviewId && !requirementId) {
      return NextResponse.json(
        { success: false, message: "Either reviewId or requirementId is required" },
        { status: 400 }
      );
    }

    // Verify the review or requirement exists and user has access
    if (reviewId) {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
          tpa: { select: { userId: true } },
          sponsor: { select: { userId: true } },
        },
      });

      if (!review) {
        return NextResponse.json(
          { success: false, message: "Review not found" },
          { status: 404 }
        );
      }

      // Check authorization
      const isReviewTpa = review.tpa.userId === user.id;
      const isReviewSponsor = review.sponsor.userId === user.id;

      if (!isReviewTpa && !isReviewSponsor) {
        return NextResponse.json(
          { success: false, message: "Not authorized to comment on this review" },
          { status: 403 }
        );
      }
    }

    if (requirementId) {
      const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        include: {
          tpa: { select: { userId: true } },
          sponsors: {
            include: { sponsor: { select: { userId: true } } },
          },
        },
      });

      if (!requirement) {
        return NextResponse.json(
          { success: false, message: "Requirement not found" },
          { status: 404 }
        );
      }

      const isReqTpa = requirement.tpa.userId === user.id;
      const isReqSponsor = requirement.sponsors.some(
        (rs) => rs.sponsor.userId === user.id
      );

      if (!isReqTpa && !isReqSponsor) {
        return NextResponse.json(
          { success: false, message: "Not authorized to comment on this requirement" },
          { status: 403 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        reviewId: reviewId ?? null,
        requirementId: requirementId ?? null,
        authorId: user.id,
        content,
        isRevisionRequest,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment created successfully",
      data: {
        id: comment.id,
        author: comment.author.name,
        role: comment.author.role,
        timestamp: comment.createdAt.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        content: comment.content,
        isRevisionRequest: comment.isRevisionRequest,
      },
    });
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create comment" },
      { status: 500 }
    );
  }
}
