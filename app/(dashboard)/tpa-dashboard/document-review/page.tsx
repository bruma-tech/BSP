import type { Metadata } from 'next';
import DocumentReviewInteractive from '@/app/components/dashboard/tpa-dashboard/document-review/DocumentReviewInteractive';
import { verifySession } from '@/app/lib/dal';
import prisma from '@/app/lib/prisma';
import { redirect } from 'next/navigation';
import type { DocumentReviewData } from '@/app/components/dashboard/document-review';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Document Review - DocFlow Portal',
  description: 'Review and approve submitted documents from sponsors with detailed feedback capabilities and version comparison tools.'
};

const reviewInclude = {
  sponsor: { select: { id: true, organizationName: true } },
  requirement: {
    select: { id: true, title: true, type: true, priority: true, dueDate: true, status: true },
  },
  documents: {
    orderBy: { version: 'desc' as const },
    include: { uploadedBy: { select: { id: true, name: true } } },
  },
  comments: {
    orderBy: { createdAt: 'asc' as const },
    include: { author: { select: { id: true, name: true, role: true } } },
  },
};

const formatDate = (date: Date) =>
  date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision Requested',
  OPEN: 'Open',
  IN_REVIEW: 'In Review',
  CLOSED: 'Closed',
};

const roleLabels: Record<string, string> = {
  tpa: 'TPA Reviewer',
  sponsor: 'Sponsor',
  user: 'User',
};

function transformReview(review: any): DocumentReviewData {
  const latestDoc = review.documents[0] ?? null;

  const document = latestDoc
    ? {
        id: latestDoc.id,
        name: latestDoc.fileName,
        type: latestDoc.fileFormat ?? 'pdf',
        url: latestDoc.filePath,
        pages: 1,
      }
    : null;

  const metadata = {
    submittedDate: review.submittedAt ? formatDate(review.submittedAt) : 'Not submitted',
    sponsor: review.sponsor.organizationName,
    requirement: review.requirement.title,
    status: latestDoc ? (statusLabels[latestDoc.status] ?? latestDoc.status) : (statusLabels[review.status] ?? review.status),
    submissionCount: review.documents.length,
    fileSize: latestDoc?.fileSize ?? 'Unknown',
    format: (latestDoc?.fileFormat ?? 'PDF').toUpperCase(),
  };

  const comments = review.comments.map((c: any) => ({
    id: c.id,
    author: c.author.name,
    role: roleLabels[c.author.role] ?? c.author.role,
    timestamp: formatDate(c.createdAt),
    content: c.content,
    isRevisionRequest: c.isRevisionRequest,
  }));

  const versions = review.documents.map((doc: any) => ({
    id: doc.id,
    version: doc.version,
    submittedDate: formatDate(doc.uploadedAt),
    status: statusLabels[doc.status] ?? doc.status,
    changes: doc.description ?? `Version ${doc.version} submission`,
  }));

  const docStatusMap: Record<string, 'approved' | 'rejected' | 'submitted'> = {
    PENDING_REVIEW: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    REVISION_REQUESTED: 'rejected',
  };

  const history = review.documents.map((doc: any) => ({
    id: `doc-${doc.id}`,
    date: formatDate(doc.uploadedAt),
    action: doc.version === 1 ? 'Initial Submission' : `Document Resubmitted (v${doc.version})`,
    reviewer: doc.uploadedBy.name,
    comment: doc.description ?? '',
    status: docStatusMap[doc.status] ?? ('submitted' as const),
  }));

  for (const c of review.comments) {
    if (c.isRevisionRequest) {
      history.push({
        id: `comment-${c.id}`,
        date: formatDate(c.createdAt),
        action: 'Revision Requested',
        reviewer: c.author.name,
        comment: c.content,
        status: 'rejected' as const,
      });
    }
  }

  history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    reviewId: review.id,
    document,
    metadata,
    history,
    comments,
    versions,
  };
}

export default async function DocumentReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewId?: string; requirementId?: string }>;
}) {
  const { isAuthenticated, user } = await verifySession();

  if (!isAuthenticated || !user) {
    redirect('/');
  }

  const { reviewId, requirementId } = await searchParams;

  if (!reviewId && !requirementId) {
    redirect('/tpa-dashboard');
  }

  const tpa = await prisma.tpa.findUnique({
    where: { userId: user.id },
  });

  if (!tpa) {
    redirect('/tpa-dashboard');
  }

  // Single review by reviewId
  if (reviewId) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: reviewInclude,
    });

    if (!review || review.tpaId !== tpa.id) {
      redirect('/tpa-dashboard');
    }

    // Also fetch all sibling reviews for sponsor switching
    const allReviews = await prisma.review.findMany({
      where: { requirementId: review.requirementId, tpaId: tpa.id },
      include: reviewInclude,
      orderBy: { createdAt: 'asc' },
    });

    const sponsorReviews = allReviews.map((r) => ({
      sponsorId: r.sponsorId,
      sponsorName: r.sponsor.organizationName,
      data: transformReview(r),
    }));

    const activeIndex = sponsorReviews.findIndex((sr) => sr.data.reviewId === reviewId);

    return (
      <div className="min-h-screen bg-background">
        <main>
          <div className="max-w-3/4 mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="mt-4">
                <h1 className="text-3xl font-semibold text-foreground">Document Review</h1>
                <p className="text-muted-foreground mt-2">
                  Review submitted documents and provide approval decisions with detailed feedback
                </p>
              </div>
            </div>

            <DocumentReviewInteractive
              sponsorReviews={sponsorReviews}
              initialSponsorIndex={activeIndex >= 0 ? activeIndex : 0}
            />
          </div>
        </main>
      </div>
    );
  }

  // By requirementId - find or create reviews for ALL assigned sponsors
  const requirement = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: {
      sponsors: {
        include: { sponsor: { select: { id: true, organizationName: true } } },
      },
    },
  });

  if (!requirement || requirement.tpaId !== tpa.id) {
    redirect('/tpa-dashboard');
  }

  if (requirement.sponsors.length === 0) {
    redirect('/tpa-dashboard');
  }

  // Get existing reviews
  const existingReviews = await prisma.review.findMany({
    where: { requirementId: requirementId!, tpaId: tpa.id },
    select: { sponsorId: true },
  });

  const existingSponsorIds = new Set(existingReviews.map((r) => r.sponsorId));

  // Create reviews for sponsors that don't have one yet
  const sponsorsNeedingReview = requirement.sponsors.filter(
    (rs) => !existingSponsorIds.has(rs.sponsorId)
  );

  if (sponsorsNeedingReview.length > 0) {
    await prisma.review.createMany({
      data: sponsorsNeedingReview.map((rs) => ({
        requirementId: requirementId!,
        tpaId: tpa.id,
        sponsorId: rs.sponsorId,
        status: 'OPEN' as const,
      })),
    });
  }

  // Fetch all reviews with full data
  const allReviews = await prisma.review.findMany({
    where: { requirementId: requirementId!, tpaId: tpa.id },
    include: reviewInclude,
    orderBy: { createdAt: 'asc' },
  });

  if (allReviews.length === 0) {
    redirect('/tpa-dashboard');
  }

  const sponsorReviews = allReviews.map((r) => ({
    sponsorId: r.sponsorId,
    sponsorName: r.sponsor.organizationName,
    data: transformReview(r),
  }));

  return (
    <div className="min-h-screen bg-background">
      <main>
        <div className="max-w-3/4 mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="mt-4">
              <h1 className="text-3xl font-semibold text-foreground">Document Review</h1>
              <p className="text-muted-foreground mt-2">
                Review submitted documents and provide approval decisions with detailed feedback
              </p>
            </div>
          </div>

          <DocumentReviewInteractive
            sponsorReviews={sponsorReviews}
            initialSponsorIndex={0}
          />
        </div>
      </main>
    </div>
  );
}
