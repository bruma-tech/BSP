'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentReviewLayout, type DocumentReviewData } from '@/app/components/dashboard/document-review';
import ReviewControls from './ReviewControls';
import Icon from '@/app/components/ui/AppIcon';

export interface SponsorReview {
  sponsorId: string;
  sponsorName: string;
  data: DocumentReviewData;
}

interface TPADocumentReviewProps {
  sponsorReviews: SponsorReview[];
  initialSponsorIndex: number;
}

const DocumentReviewInteractive = ({ sponsorReviews, initialSponsorIndex }: TPADocumentReviewProps) => {
  const router = useRouter();
  const [activeSponsorIndex, setActiveSponsorIndex] = useState(initialSponsorIndex);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'accept' | 'reject' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeReview = sponsorReviews[activeSponsorIndex];
  const data = activeReview.data;

  const handleReview = async (decision: 'accept' | 'reject', comment: string) => {
    if (!data.document) return;

    try {
      const response = await fetch(`/api/reviews/${data.reviewId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: data.document.id,
          decision,
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || 'Failed to submit decision');
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      setReviewDecision(decision);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        router.refresh();
      }, 3000);
    } catch {
      setErrorMessage('Network error. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleAddComment = () => {
    router.refresh();
  };

  return (
    <>
      {showSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-card border border-border rounded-lg shadow-modal p-4 animate-slide-in-right">
          <div className="flex items-start gap-3">
            <Icon
              name={reviewDecision === 'accept' ? 'CheckCircleIcon' : 'XCircleIcon'}
              size={24}
              className={reviewDecision === 'accept' ? 'text-success' : 'text-error'}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Document {reviewDecision === 'accept' ? 'Approved' : 'Rejected'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reviewDecision === 'accept' ? 'The sponsor has been notified of approval' : 'The sponsor will be notified to resubmit'}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-card border border-error rounded-lg shadow-modal p-4 animate-slide-in-right">
          <div className="flex items-start gap-3">
            <Icon name="ExclamationTriangleIcon" size={24} className="text-error" />
            <p className="text-sm font-semibold text-foreground">{errorMessage}</p>
          </div>
        </div>
      )}

      {sponsorReviews.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="BuildingOfficeIcon" size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Reviewing sponsor ({activeSponsorIndex + 1} of {sponsorReviews.length})
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sponsorReviews.map((sr, index) => (
              <button
                key={sr.sponsorId}
                onClick={() => setActiveSponsorIndex(index)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  index === activeSponsorIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {sr.sponsorName}
                <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                  index === activeSponsorIndex
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {sr.data.metadata.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <DocumentReviewLayout
        data={data}
        showRevisionCheckbox={true}
        onAddComment={handleAddComment}
        actionSlot={
          data.document ? (
            <ReviewControls documentId={data.document.id} onReview={handleReview} />
          ) : null
        }
      />
    </>
  );
};

export default DocumentReviewInteractive;
