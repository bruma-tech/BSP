'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';

interface Sponsor {
    id: string;
    name: string;
}

interface Requirement {
    id: string;
    title: string;
    description: string;
    type: string;
    assignedSponsors: Sponsor[];
    dueDate: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    completionRate: number;
    totalDocuments: number;
    submittedDocuments: number;
    priority: 'low' | 'medium' | 'high';
}

interface RequirementCardProps {
    requirement: Requirement;
    onEdit: (id: string) => void;
    onViewSubmissions: (id: string) => void;
    onSendReminder: (id: string) => void;
    onDelete: (id: string) => void;
}

const RequirementCard = ({
    requirement,
    onEdit,
    onViewSubmissions,
    onSendReminder,
    onDelete,
}: RequirementCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success/10 text-success';
            case 'in-progress':
                return 'bg-primary/10 text-primary';
            case 'overdue':
                return 'bg-error/10 text-error';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-error/10 text-error';
            case 'medium':
                return 'bg-warning/10 text-warning';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-1 truncate">
                        {requirement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {requirement.description}
                    </p>
                </div>
                <div className="relative ml-3">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                        aria-label="More options"
                    >
                        <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
                    </button>
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-20">
                                <button
                                    onClick={() => {
                                        onEdit(requirement.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                                >
                                    <Icon name="PencilIcon" size={16} />
                                    Edit Details
                                </button>
                                <button
                                    onClick={() => {
                                        onViewSubmissions(requirement.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                                >
                                    <Icon name="DocumentTextIcon" size={16} />
                                    View Submissions
                                </button>
                                <button
                                    onClick={() => {
                                        onSendReminder(requirement.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                                >
                                    <Icon name="BellIcon" size={16} />
                                    Send Reminder
                                </button>
                                <div className="border-t border-border my-1" />
                                <button
                                    onClick={() => {
                                        onDelete(requirement.id);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-muted transition-colors duration-200"
                                >
                                    <Icon name="TrashIcon" size={16} />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(requirement.status)}`}>
                    {requirement.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
                    {requirement.priority.toUpperCase()} PRIORITY
                </span>
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {requirement.type}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assigned Sponsors:</span>
                    <span className="font-medium text-foreground">{requirement.assignedSponsors.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium text-foreground">{requirement.dueDate}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Documents:</span>
                    <span className="font-medium text-foreground">
                        {requirement.submittedDocuments} / {requirement.totalDocuments}
                    </span>
                </div>

                <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Completion:</span>
                        <span className="font-medium text-foreground">{requirement.completionRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${requirement.completionRate === 100
                                ? 'bg-success'
                                : requirement.completionRate >= 50
                                    ? 'bg-primary' : 'bg-warning'
                                }`}
                            style={{ width: `${requirement.completionRate}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequirementCard;