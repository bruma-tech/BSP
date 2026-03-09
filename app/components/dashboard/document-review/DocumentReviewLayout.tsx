'use client';

import { useState, useEffect, ReactNode } from 'react';
import DocumentViewer from './DocumentViewer';
import DocumentMetadata from './DocumentMetadata';
import SubmissionHistory from './SubmissionHistory';
import CommentSystem from './CommentSystem';
import VersionComparison from './VersionComparison';
import Icon from '@/app/components/ui/AppIcon';

export interface DocumentReviewData {
  reviewId: string;
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    pages: number;
  } | null;
  metadata: {
    submittedDate: string;
    sponsor: string;
    requirement: string;
    status: string;
    submissionCount: number;
    fileSize: string;
    format: string;
  };
  history: {
    id: string;
    date: string;
    action: string;
    reviewer: string;
    comment: string;
    status: 'approved' | 'rejected' | 'submitted';
  }[];
  comments: {
    id: string;
    author: string;
    role: string;
    timestamp: string;
    content: string;
    isRevisionRequest: boolean;
  }[];
  versions: {
    id: string;
    version: number;
    submittedDate: string;
    status: string;
    changes: string;
  }[];
}

interface DocumentReviewLayoutProps {
  data: DocumentReviewData;
  actionSlot?: ReactNode;
  showRevisionCheckbox?: boolean;
  onAddComment?: (content: string, isRevisionRequest: boolean) => void;
  onCompareVersion?: (versionId: string) => void;
}

const DocumentReviewLayout = ({
  data,
  actionSlot,
  showRevisionCheckbox = true,
  onAddComment,
  onCompareVersion,
}: DocumentReviewLayoutProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'history' | 'comments' | 'versions'>('metadata');

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

  const handleAddComment = (content: string, isRevisionRequest: boolean) => {
    if (onAddComment) {
      onAddComment(content, isRevisionRequest);
    }
    console.log('New comment:', content, 'Revision request:', isRevisionRequest);
  };

  const handleCompareVersion = (versionId: string) => {
    if (onCompareVersion) {
      onCompareVersion(versionId);
    }
    console.log('Comparing version:', versionId);
  };

  return (
    <div className="flex flex-row gap-6">
      <div className="flex-2">
        {data.document ? (
          <DocumentViewer document={data.document} />
        ) : (
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <div className="text-center">
              <Icon name="DocumentIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No document submitted yet</p>
            </div>
          </div>
        )}
        <div className={activeTab === 'comments' ? 'block' : 'lg:block'}>
          <CommentSystem
            comments={data.comments}
            onAddComment={handleAddComment}
            showRevisionCheckbox={showRevisionCheckbox}
            reviewId={data.reviewId}
          />
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
            <DocumentMetadata metadata={data.metadata} />
          </div>

          <div className={activeTab === 'history' ? 'block' : 'lg:block'}>
            <SubmissionHistory history={data.history} />
          </div>

          <div className={activeTab === 'versions' ? 'block' : 'lg:block'}>
            <VersionComparison versions={data.versions} onCompare={handleCompareVersion} />
          </div>

          {actionSlot && (
            <div className="block">
              {actionSlot}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewLayout;
