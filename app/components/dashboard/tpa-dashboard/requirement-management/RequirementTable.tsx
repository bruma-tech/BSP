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

interface RequirementTableProps {
    requirements: Requirement[];
    selectedRequirements: string[];
    onSelectRequirement: (id: string) => void;
    onSelectAll: () => void;
    onEdit: (id: string) => void;
    onViewSubmissions: (id: string) => void;
    onSendReminder: (id: string) => void;
    onDelete: (id: string) => void;
    onSort: (column: string) => void;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
}

const RequirementTable = ({
    requirements,
    selectedRequirements,
    onSelectRequirement,
    onSelectAll,
    onEdit,
    onViewSubmissions,
    onSendReminder,
    onDelete,
    onSort,
    sortColumn,
    sortDirection,
}: RequirementTableProps) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
                return 'text-error';
            case 'medium':
                return 'text-warning';
            default:
                return 'text-muted-foreground';
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortColumn !== column) {
            return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
        }
        return sortDirection === 'asc' ? (
            <Icon name="ChevronUpIcon" size={16} className="text-primary" />
        ) : (
            <Icon name="ChevronDownIcon" size={16} className="text-primary" />
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                    <tr>
                        <th className="px-4 py-3 text-left w-12">
                            <input
                                type="checkbox"
                                checked={selectedRequirements.length === requirements.length && requirements.length > 0}
                                onChange={onSelectAll}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                            />
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('title')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Requirement Title
                                <SortIcon column="title" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('type')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Type
                                <SortIcon column="type" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('sponsors')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Assigned Sponsors
                                <SortIcon column="sponsors" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('dueDate')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Due Date
                                <SortIcon column="dueDate" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('status')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Status
                                <SortIcon column="status" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-left">
                            <button
                                onClick={() => onSort('completion')}
                                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors duration-200"
                            >
                                Completion
                                <SortIcon column="completion" />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-center w-20">
                            <span className="text-sm font-semibold text-foreground">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {requirements.map((requirement) => (
                        <tr key={requirement.id} className="hover:bg-muted/30 transition-colors duration-200">
                            <td className="px-4 py-4">
                                <input
                                    type="checkbox"
                                    checked={selectedRequirements.includes(requirement.id)}
                                    onChange={() => onSelectRequirement(requirement.id)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                />
                            </td>
                            <td className="px-4 py-4">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{requirement.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                        {requirement.description}
                                    </p>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                    {requirement.type}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="BuildingOfficeIcon" size={16} className="text-muted-foreground" />
                                    <span className="text-sm text-foreground">{requirement.assignedSponsors.length}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="CalendarIcon" size={16} className={getPriorityColor(requirement.priority)} />
                                    <span className="text-sm text-foreground">{requirement.dueDate}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(requirement.status)}`}>
                                    {requirement.status.replace('-', '').toUpperCase()}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden min-w-[60px]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${requirement.completionRate === 100
                                                ? 'bg-success'
                                                : requirement.completionRate >= 50
                                                    ? 'bg-primary' : 'bg-warning'
                                                }`}
                                            style={{ width: `${requirement.completionRate}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                        {requirement.completionRate}%
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === requirement.id ? null : requirement.id)}
                                        className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                                        aria-label="More options"
                                    >
                                        <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
                                    </button>
                                    {openMenuId === requirement.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenMenuId(null)}
                                            />
                                            <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg py-1 z-20">
                                                <button
                                                    onClick={() => {
                                                        onEdit(requirement.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                                                >
                                                    <Icon name="PencilIcon" size={16} />
                                                    Edit Details
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onViewSubmissions(requirement.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                                                >
                                                    <Icon name="DocumentTextIcon" size={16} />
                                                    View Submissions
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onSendReminder(requirement.id);
                                                        setOpenMenuId(null);
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
                                                        setOpenMenuId(null);
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequirementTable;