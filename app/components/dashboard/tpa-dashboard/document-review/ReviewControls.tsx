'use client';

import { useState } from 'react';
import Icon from "@/app/components/ui/AppIcon";

interface ReviewControlsProps {
    documentId: string;
    onReview: (decision: 'accept' | 'reject', comment: string) => void;
}

const ReviewControls = ({ documentId, onReview }: ReviewControlsProps) => {
    const [comment, setComment] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onReview('accept', comment);
            setComment('');
            setIsSubmitting(false);
        }, 1000);
    };

    const handleReject = () => {
        if (!comment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onReview('reject', comment);
            setComment('');
            setShowRejectForm(false);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Review Decision</h3>

            <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-foreground mb-2">
                    Comments {showRejectForm && <span className="text-error">*</span>}
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={showRejectForm ? "Please provide specific reasons for rejection..." : "Add optional comments about this document..."}
                    className="w-full px-4 py-3 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    {comment.length}/500 characters
                </p>
            </div>

            {!showRejectForm ? (
                <div className="flex gap-3">
                    <button
                        onClick={handleAccept}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-success text-success-foreground rounded-md font-medium hover:bg-success/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="CheckCircleIcon" size={20} />
                        Accept Document
                    </button>
                    <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-error text-error-foreground rounded-md font-medium hover:bg-error/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="XCircleIcon" size={20} />
                        Reject Document
                    </button>
                </div>
            ) : (
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setShowRejectForm(false);
                            setComment('');
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isSubmitting || !comment.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-error text-error-foreground rounded-md font-medium hover:bg-error/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="XCircleIcon" size={20} />
                        Confirm Rejection
                    </button>
                </div>
            )}

            <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Icon name="InformationCircleIcon" size={16} className="flex-shrink-0 mt-0.5" />
                    <p>
                        Your decision will be recorded in the audit trail. Rejected documents will require resubmission from the sponsor.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReviewControls;