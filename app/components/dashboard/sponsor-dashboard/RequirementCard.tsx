'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';


interface RequirementCardProps {
  requirement: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'overdue' | 'pending' | 'submitted' | 'approved' | 'rejected';
    priority: 'high' | 'medium' | 'low';
    documentType: string;
    submittedDate?: string;
    reviewFeedback?: string;
    attachments?: number;
  };
  onUpload: (id: string) => void;
  onViewDetails: (id: string) => void;
  onViewHistory: (id: string) => void;
}

const RequirementCard = ({ requirement, onUpload, onViewDetails, onViewHistory }: RequirementCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status: string) => {
    const configs = {
      overdue: { bg: 'bg-error/10', text: 'text-error', icon: 'ExclamationTriangleIcon', label: 'Overdue' },
      pending: { bg: 'bg-warning/10', text: 'text-warning', icon: 'ClockIcon', label: 'Pending' },
      submitted: { bg: 'bg-primary/10', text: 'text-primary', icon: 'DocumentCheckIcon', label: 'Submitted' },
      approved: { bg: 'bg-success/10', text: 'text-success', icon: 'CheckCircleIcon', label: 'Approved' },
      rejected: { bg: 'bg-error/10', text: 'text-error', icon: 'XCircleIcon', label: 'Rejected' }
    };
    return configs[status as keyof typeof configs];
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: { bg: 'bg-error', text: 'text-error-foreground', label: 'High Priority' },
      medium: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Medium Priority' },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Low Priority' }
    };
    return configs[priority as keyof typeof configs];
  };

  const statusConfig = getStatusConfig(requirement.status);
  const priorityConfig = getPriorityConfig(requirement.priority);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">{requirement.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
              {priorityConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{requirement.description}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg}`}>
          <Icon name={statusConfig.icon as any} size={16} className={statusConfig.text} />
          <span className={`text-xs font-medium ${statusConfig.text}`}>{statusConfig.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="CalendarIcon" size={18} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-sm font-medium text-foreground">{requirement.dueDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="DocumentTextIcon" size={18} className="text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Document Type</p>
            <p className="text-sm font-medium text-foreground">{requirement.documentType}</p>
          </div>
        </div>
      </div>

      {requirement.submittedDate && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-md">
          <Icon name="CheckCircleIcon" size={18} className="text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Submitted on</p>
            <p className="text-sm font-medium text-foreground">{requirement.submittedDate}</p>
          </div>
          {requirement.attachments && (
            <div className="ml-auto flex items-center gap-1">
              <Icon name="PaperClipIcon" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{requirement.attachments}</span>
            </div>
          )}
        </div>
      )}

      {requirement.reviewFeedback && isExpanded && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
          <div className="flex items-start gap-2">
            <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-warning mt-0.5" />
            <div>
              <p className="text-xs font-medium text-warning mb-1">Review Feedback</p>
              <p className="text-sm text-foreground">{requirement.reviewFeedback}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        {requirement.status !== 'approved' && (
          <button
            onClick={() => onUpload(requirement.id)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-fast text-sm font-medium"
          >
            <Icon name="ArrowUpTrayIcon" size={18} />
            {requirement.status === 'rejected' ? 'Resubmit' : 'Upload Document'}
          </button>
        )}
        <button
          onClick={() => onViewDetails(requirement.id)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors duration-fast text-sm font-medium text-foreground"
        >
          <Icon name="DocumentMagnifyingGlassIcon" size={18} />
          View Details
        </button>
        <button
          onClick={() => onViewHistory(requirement.id)}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors duration-fast text-sm font-medium text-foreground"
        >
          <Icon name="ClockIcon" size={18} />
          History
        </button>
        {requirement.reviewFeedback && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-2 hover:bg-muted rounded-md transition-colors duration-fast"
            aria-label={isExpanded ? 'Collapse feedback' : 'Expand feedback'}
          >
            <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RequirementCard;