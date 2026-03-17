import { NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

/**
 * GET /api/reviews/[reviewId]
 * Fetch a single review with all related data.
 * Both TPA and Sponsor can access their own reviews.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { reviewId } = await params;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        sponsor: {
          select: { id: true, organizationName: true },
        },
        tpa: {
          select: { id: true, organizationName: true, userId: true },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            type: true,
            priority: true,
            dueDate: true,
            status: true,
            allowResubmission: true,
          },
        },
        documents: {
          orderBy: { version: "desc" },
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Authorization: only the TPA or Sponsor involved can view
    if (user.role === "tpa" || user.role === "user") {
      if (review.tpa.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Not authorized to view this review" },
          { status: 403 }
        );
      }
    } else if (user.role === "sponsor") {
      const sponsor = await prisma.sponsor.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!sponsor || sponsor.id !== review.sponsorId) {
        return NextResponse.json(
          { success: false, message: "Not authorized to view this review" },
          { status: 403 }
        );
      }
    }

    // Build response: latest document, metadata, all versions, comments, history
    const latestDoc = review.documents[0] ?? null;
    const submissionCount = review.documents.length;

    const document = latestDoc
      ? {
          id: latestDoc.id,
          name: latestDoc.fileName,
          type: latestDoc.fileFormat ?? "pdf",
          url: latestDoc.filePath,
          pages: 1,
        }
      : null;

    const metadata = {
      submittedDate: review.submittedAt
        ? review.submittedAt.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "Not submitted",
      sponsor: review.sponsor.organizationName,
      requirement: review.requirement.title,
      status: latestDoc
        ? formatDocumentStatus(latestDoc.status)
        : formatReviewStatus(review.status),
      submissionCount,
      fileSize: latestDoc?.fileSize ?? "Unknown",
      format: (latestDoc?.fileFormat ?? "PDF").toUpperCase(),
    };

    const comments = review.comments.map((c) => ({
      id: c.id,
      author: c.author.name,
      role: getRoleLabel(c.author.role),
      timestamp: c.createdAt.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      content: c.content,
      isRevisionRequest: c.isRevisionRequest,
    }));

    const versions = review.documents.map((doc) => ({
      id: doc.id,
      version: doc.version,
      submittedDate: doc.uploadedAt.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: formatDocumentStatus(doc.status),
      changes: doc.description ?? `Version ${doc.version} submission`,
    }));

    // Build history from documents + comments that are revision requests
    const history = buildHistory(review.documents, review.comments);

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.id,
        reviewStatus: review.status,
        document,
        metadata,
        comments,
        versions,
        history,
      },
    });
  } catch (error) {
    console.error("GET /api/reviews/[reviewId] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

function formatDocumentStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING_REVIEW: "Pending Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    REVISION_REQUESTED: "Revision Requested",
  };
  return map[status] ?? status;
}

function formatReviewStatus(status: string): string {
  const map: Record<string, string> = {
    OPEN: "Open",
    IN_REVIEW: "In Review",
    CLOSED: "Closed",
  };
  return map[status] ?? status;
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    tpa: "TPA Reviewer",
    sponsor: "Sponsor",
    user: "User",
  };
  return map[role] ?? role;
}

function buildHistory(
  documents: Array<{
    id: string;
    version: number;
    status: string;
    uploadedAt: Date;
    uploadedBy: { name: string };
    description: string | null;
  }>,
  comments: Array<{
    id: string;
    isRevisionRequest: boolean;
    content: string;
    createdAt: Date;
    author: { name: string; role: string };
  }>
) {
  const entries: Array<{
    id: string;
    date: string;
    action: string;
    reviewer: string;
    comment: string;
    status: "approved" | "rejected" | "submitted";
  }> = [];

  // Add document submissions
  for (const doc of documents) {
    const statusMap: Record<string, "approved" | "rejected" | "submitted"> = {
      PENDING_REVIEW: "submitted",
      APPROVED: "approved",
      REJECTED: "rejected",
      REVISION_REQUESTED: "rejected",
    };

    entries.push({
      id: `doc-${doc.id}`,
      date: doc.uploadedAt.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      action:
        doc.version === 1
          ? "Initial Submission"
          : `Document Resubmitted (v${doc.version})`,
      reviewer: doc.uploadedBy.name,
      comment: doc.description ?? "",
      status: statusMap[doc.status] ?? "submitted",
    });
  }

  // Add revision request comments as rejection events
  for (const comment of comments) {
    if (comment.isRevisionRequest) {
      entries.push({
        id: `comment-${comment.id}`,
        date: comment.createdAt.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        action: "Revision Requested",
        reviewer: comment.author.name,
        comment: comment.content,
        status: "rejected",
      });
    }
  }

  // Sort by date descending (newest first)
  entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return entries;
}
