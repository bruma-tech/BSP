'use client';

import { useState } from 'react';
import Icon from '../ui/AppIcon';

interface SubmissionRecord {
  id: string;
  submittedDate: string;
  version: string;
  status: 'Approved' | 'Rejected' | 'In Review';
  reviewedBy?: string;
  reviewDate?: string;
  feedback?: string;
  resubmissionRequired: boolean;
}

interface SubmissionHistoryProps {
  submissions: SubmissionRecord[];
}

export default function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon name="ClockIcon" size={32} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No Submission History</p>
        <p className="text-xs text-muted-foreground">Your previous submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Submission History</h3>

      <div className="space-y-3">
        {submissions.map((submission) => (
          <div key={submission.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleExpand(submission.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  submission.status === 'Approved' ? 'bg-success/10' :
                  submission.status === 'Rejected'? 'bg-error/10' : 'bg-primary/10'
                }`}>
                  <Icon
                    name={
                      submission.status === 'Approved' ? 'CheckCircleIcon' :
                      submission.status === 'Rejected'? 'XCircleIcon' : 'ClockIcon'
                    }
                    size={20}
                    className={
                      submission.status === 'Approved' ? 'text-success' :
                      submission.status === 'Rejected'? 'text-error' : 'text-primary'
                    }
                  />
                </div>

                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Version {submission.version}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted on {submission.submittedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  submission.status === 'Approved' ? 'bg-success/10 text-success' :
                  submission.status === 'Rejected'? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                }`}>
                  {submission.status}
                </span>
                <Icon
                  name="ChevronDownIcon"
                  size={20}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    expandedId === submission.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {expandedId === submission.id && (
              <div className="px-4 pb-4 border-t border-border bg-muted/30">
                <div className="pt-4 space-y-3">
                  {submission.reviewedBy && (
                    <div className="flex items-start gap-2">
                      <Icon name="UserCircleIcon" size={16} className="text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Reviewed by</p>
                        <p className="text-sm text-foreground">{submission.reviewedBy}</p>
                      </div>
                    </div>
                  )}

                  {submission.reviewDate && (
                    <div className="flex items-start gap-2">
                      <Icon name="CalendarIcon" size={16} className="text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Review date</p>
                        <p className="text-sm text-foreground">{submission.reviewDate}</p>
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="flex items-start gap-2">
                      <Icon name="ChatBubbleLeftIcon" size={16} className="text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                        <p className="text-sm text-foreground">{submission.feedback}</p>
                      </div>
                    </div>
                  )}

                  {submission.resubmissionRequired && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md flex items-start gap-2">
                      <Icon name="ExclamationTriangleIcon" size={18} className="text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning mb-1">Resubmission Required</p>
                        <p className="text-xs text-foreground/80">
                          Please address the feedback and resubmit the document
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}