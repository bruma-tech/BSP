'use client';

import { useState, useEffect } from 'react';
import DocumentViewer from './DocumentViewer';
import DocumentMetadata from './DocumentMetadata';
import SubmissionHistory from './SubmissionHistory';
import ReviewControls from './ReviewControls';
import CommentSystem from './CommentSystem';
import VersionComparison from './VersionComparison';
import Icon from '@/app/components/ui/AppIcon';

interface DocumentReviewInteractiveProps {
  initialDocument: any;
  initialMetadata: any;
  initialHistory: any[];
  initialComments: any[];
  initialVersions: any[];
}

const DocumentReviewInteractive = ({
  initialDocument,
  initialMetadata,
  initialHistory,
  initialComments,
  initialVersions,
}: DocumentReviewInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'history' | 'comments' | 'versions'>('metadata');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon name="ArrowPathIcon" size={48} className="text-primary mx-auto mb-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading document review...</p>
        </div>
      </div>
    );
  }

  const handleReview = (decision: 'accept' | 'reject', comment: string) => {
    setReviewDecision(decision);
    setShowSuccessMessage(true);
    console.log('Review decision:', decision, 'Comment:', comment);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleAddComment = (content: string, isRevisionRequest: boolean) => {
    console.log('New comment:', content, 'Revision request:', isRevisionRequest);
  };

  const handleCompareVersion = (versionId: string) => {
    console.log('Comparing version:', versionId);
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

      <div className="flex flex-row gap-6">
        <div className="flex-2">
          <DocumentViewer document={initialDocument} />
          <div className={activeTab === 'comments' ? 'block' : 'lg:block'}>
            <CommentSystem comments={initialComments} onAddComment={handleAddComment} />
          </div>
        </div>
        <div className="flex-1 w-full lg:w-96 space-y-6">
          <div className="lg:hidden">
            <div className="flex gap-2 border-b border-border">
              {[
                { id: 'metadata', label: 'Info', icon: 'InformationCircleIcon' },
                { id: 'history', label: 'History', icon: 'ClockIcon' },
                { id: 'comments', label: 'Comments', icon: 'ChatBubbleLeftRightIcon' },
                { id: 'versions', label: 'Versions', icon: 'DocumentDuplicateIcon' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors duration-fast ${activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Icon name={tab.icon as any} size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className={activeTab === 'metadata' ? 'block' : 'lg:block'}>
              <DocumentMetadata metadata={initialMetadata} />
            </div>

            <div className={activeTab === 'history' ? 'block' : 'lg:block'}>
              <SubmissionHistory history={initialHistory} />
            </div>
            <div className={activeTab === 'versions' ? 'block' : 'lg:block'}>
              <VersionComparison versions={initialVersions} onCompare={handleCompareVersion} />
            </div>

            <div className="block">
              <ReviewControls documentId={initialDocument.id} onReview={handleReview} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentReviewInteractive;