import type { Metadata } from 'next';
import SponsorDocumentReviewInteractive from '@/app/components/dashboard/sponsor-dashboard/document-review/SponsorDocumentReviewInteractive';
import { verifySession } from '@/app/lib/dal';
import prisma from '@/app/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Document Review - Sponsor Portal',
  description: 'View submitted documents, track review status, and collaborate with your TPA reviewer.'
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

export default async function SponsorDocumentReviewPage({
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
    redirect('/sponsor-dashboard');
  }

  const sponsor = await prisma.sponsor.findUnique({
    where: { userId: user.id },
  });

  if (!sponsor) {
    redirect('/sponsor-dashboard');
  }

  let review;

  if (reviewId) {
    review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: reviewInclude,
    });

    if (!review || review.sponsorId !== sponsor.id) {
      redirect('/sponsor-dashboard');
    }
  } else if (requirementId) {
    // Try to find an existing review
    review = await prisma.review.findFirst({
      where: { requirementId, sponsorId: sponsor.id },
      include: reviewInclude,
    });

    // If no review exists, auto-create one
    if (!review) {
      // Verify the sponsor is assigned to this requirement
      const requirementSponsor = await prisma.requirementSponsor.findFirst({
        where: { requirementId, sponsorId: sponsor.id },
        include: {
          requirement: { select: { tpaId: true } },
        },
      });

      if (!requirementSponsor) {
        redirect('/sponsor-dashboard');
      }

      const newReview = await prisma.review.create({
        data: {
          requirementId,
          sponsorId: sponsor.id,
          tpaId: requirementSponsor.requirement.tpaId,
          status: 'OPEN',
        },
      });

      // Re-fetch with full includes
      review = await prisma.review.findUnique({
        where: { id: newReview.id },
        include: reviewInclude,
      });

      if (!review) {
        redirect('/sponsor-dashboard');
      }
    }
  }

  if (!review) {
    redirect('/sponsor-dashboard');
  }

  // Transform DB data to component format
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

  const metadata2 = {
    submittedDate: review.submittedAt ? formatDate(review.submittedAt) : 'Not submitted',
    sponsor: review.sponsor.organizationName,
    requirement: review.requirement.title,
    status: latestDoc ? (statusLabels[latestDoc.status] ?? latestDoc.status) : (statusLabels[review.status] ?? review.status),
    submissionCount: review.documents.length,
    fileSize: latestDoc?.fileSize ?? 'Unknown',
    format: (latestDoc?.fileFormat ?? 'PDF').toUpperCase(),
  };

  const comments = review.comments.map((c) => ({
    id: c.id,
    author: c.author.name,
    role: roleLabels[c.author.role] ?? c.author.role,
    timestamp: formatDate(c.createdAt),
    content: c.content,
    isRevisionRequest: c.isRevisionRequest,
  }));

  const versions = review.documents.map((doc) => ({
    id: doc.id,
    version: doc.version,
    submittedDate: formatDate(doc.uploadedAt),
    status: statusLabels[doc.status] ?? doc.status,
    changes: doc.description ?? `Version ${doc.version} submission`,
  }));

  const history = review.documents.map((doc) => {
    const docStatusMap: Record<string, 'approved' | 'rejected' | 'submitted'> = {
      PENDING_REVIEW: 'submitted',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      REVISION_REQUESTED: 'rejected',
    };
    return {
      id: `doc-${doc.id}`,
      date: formatDate(doc.uploadedAt),
      action: doc.version === 1 ? 'Initial Submission' : `Document Resubmitted (v${doc.version})`,
      reviewer: doc.uploadedBy.name,
      comment: doc.description ?? '',
      status: docStatusMap[doc.status] ?? ('submitted' as const),
    };
  });

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

  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <div className="max-w-3/4 mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="mt-4">
              <h1 className="text-3xl font-semibold text-foreground">Document Review</h1>
              <p className="text-muted-foreground mt-2">
                View your submitted documents and track the review progress
              </p>
            </div>
          </div>

          <SponsorDocumentReviewInteractive
            data={{
              reviewId: review.id,
              document,
              metadata: metadata2,
              history,
              comments,
              versions,
            }}
          />
        </div>
      </main>
    </div>
  );
}
