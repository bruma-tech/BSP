import { NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";
import prisma from "@/app/lib/prisma";

export async function GET() {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "tpa" && user.role !== "user") {
    return NextResponse.json({ success: false, message: "TPA access only" }, { status: 403 });
  }

  try {
    const tpa = await prisma.tpa.findUnique({ where: { userId: user.id } });

    if (!tpa) {
      return NextResponse.json({ success: false, message: "TPA profile not found" }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: {
        review: { tpaId: tpa.id },
      },
      include: {
        review: {
          include: {
            sponsor: { select: { organizationName: true } },
            requirement: { select: { title: true } },
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      take: 20,
    });

    const requirements = await prisma.requirement.findMany({
      where: { tpaId: tpa.id },
      include: {
        sponsors: {
          take: 1,
          include: {
            sponsor: { select: { organizationName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const comments = await prisma.comment.findMany({
      where: {
        authorId: user.id,
        reviewId: { not: null },
      },
      include: {
        review: {
          include: {
            sponsor: { select: { organizationName: true } },
            requirement: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    type ActivityType = "submission" | "requirement" | "approval" | "rejection" | "comment";

    interface ActivityEntry {
      id: string;
      type: ActivityType;
      title: string;
      description: string;
      sponsor: string;
      timestamp: Date;
    }

    const feed: ActivityEntry[] = [];

    for (const doc of documents) {
      const sponsor = doc.review.sponsor.organizationName;
      const reqTitle = doc.review.requirement.title;

      if (doc.status === "APPROVED") {
        feed.push({
          id: `doc-approved-${doc.id}`,
          type: "approval",
          title: "Document Approved",
          description: `${doc.fileName} approved for "${reqTitle}"`,
          sponsor,
          timestamp: doc.updatedAt,
        });
      } else if (doc.status === "REJECTED") {
        feed.push({
          id: `doc-rejected-${doc.id}`,
          type: "rejection",
          title: "Document Rejected",
          description: `${doc.fileName} rejected for "${reqTitle}"`,
          sponsor,
          timestamp: doc.updatedAt,
        });
      } else {
        feed.push({
          id: `doc-submitted-${doc.id}`,
          type: "submission",
          title: doc.version > 1 ? "Document Resubmitted" : "Document Submitted",
          description: `${doc.fileName} uploaded for "${reqTitle}"`,
          sponsor,
          timestamp: doc.uploadedAt,
        });
      }
    }

    for (const req of requirements) {
      const sponsor =
        req.sponsors[0]?.sponsor.organizationName ?? "Multiple sponsors";
      feed.push({
        id: `req-${req.id}`,
        type: "requirement",
        title: "Requirement Created",
        description: `"${req.title}" assigned`,
        sponsor,
        timestamp: req.createdAt,
      });
    }

    for (const comment of comments) {
      if (!comment.review) continue;
      feed.push({
        id: `comment-${comment.id}`,
        type: comment.isRevisionRequest ? "rejection" : "comment" as ActivityType,
        title: comment.isRevisionRequest ? "Revision Requested" : "Comment Added",
        description: `${comment.isRevisionRequest ? "Revision requested" : "Comment left"} on "${comment.review.requirement.title}"`,
        sponsor: comment.review.sponsor.organizationName,
        timestamp: comment.createdAt,
      });
    }

    feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const top5 = feed.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: top5.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        sponsor: item.sponsor,
        timestamp: item.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/activity error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}