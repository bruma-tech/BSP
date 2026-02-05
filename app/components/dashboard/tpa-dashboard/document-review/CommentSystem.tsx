'use client';

import { useState } from 'react';
import Icon from "@/app/components/ui/AppIcon";

interface Comment {
    id: string;
    author: string;
    role: string;
    timestamp: string;
    content: string;
    isRevisionRequest: boolean;
}

interface CommentSystemProps {
    comments: Comment[];
    onAddComment: (content: string, isRevisionRequest: boolean) => void;
}

const CommentSystem = ({ comments, onAddComment }: CommentSystemProps) => {
    const [newComment, setNewComment] = useState('');
    const [isRevisionRequest, setIsRevisionRequest] = useState(false);

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment, isRevisionRequest);
        setNewComment('');
        setIsRevisionRequest(false);
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Comments & Feedback</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon name="ChatBubbleLeftRightIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No comments yet. Be the first to add feedback.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                        {comment.author.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{comment.author}</p>
                                        <p className="text-xs text-muted-foreground">{comment.role}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{comment.timestamp}</span>
                            </div>
                            {comment.isRevisionRequest && (
                                <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-warning/10 border border-warning/20 rounded text-xs text-warning font-medium">
                                    <Icon name="ExclamationTriangleIcon" size={14} />
                                    Revision Requested
                                </div>
                            )}
                            <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="pt-4 border-t border-border space-y-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your feedback or request revisions..."
                    className="w-full px-4 py-3 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={3}
                />
                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isRevisionRequest}
                            onChange={(e) => setIsRevisionRequest(e.target.checked)}
                            className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Request revision</span>
                    </label>
                    <button
                        onClick={handleSubmit}
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="PaperAirplaneIcon" size={16} />
                        Add Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentSystem;