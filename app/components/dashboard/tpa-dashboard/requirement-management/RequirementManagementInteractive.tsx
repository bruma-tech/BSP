'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/app/components/ui/AppIcon';
import type { RequirementFormData } from './CreateRequirementModal';
import FilterPanel, { FilterState } from './FilterPanel'
import RequirementTable from './RequirementTable';
import RequirementCard from './RequirementCard';
import BulkActionsBar from './BulkActionsBar';
import { modalBus } from "@/app/lib/modalBus";

interface Sponsor {
    id: string;
    name: string;
    email: string;
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

// Maps Prisma enum values to the UI display values
const statusMap: Record<string, Requirement['status']> = {
    OPEN: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
    CLOSED: 'completed',
};

const priorityMap: Record<string, Requirement['priority']> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
};

const typeMap: Record<string, string> = {
    FINANCIAL_REPORT: 'Financial Report',
    COMPLIANCE_DOCUMENT: 'Compliance Document',
    PLAN_DOCUMENT: 'Plan Document',
    AUDIT_REPORT: 'Audit Report',
    TAX_FILING: 'Tax Filing',
    LEGAL_DOCUMENT: 'Legal Document',
    OTHER: 'Other',
};

const RequirementManagementInteractive = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [sortColumn, setSortColumn] = useState('title');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        status: [],
        priority: [],
        type: [],
        sponsors: [],
        dateRange: { start: '', end: '' },
    });

    const [requirements, setRequirements] = useState<Requirement[]>([]);

    const fetchData = useCallback(async () => {
        const [reqRes, sponsorRes] = await Promise.all([
            fetch('/api/requirements'),
            fetch('/api/sponsors'),
        ]);

        if (sponsorRes.ok) {
            const sponsorData = await sponsorRes.json();
            setSponsors(sponsorData.data ?? []);
        }

        if (reqRes.ok) {
            const reqData = await reqRes.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: Requirement[] = (reqData.data ?? []).map((r: any) => ({
                id: r.id,
                title: r.title,
                description: r.description ?? '',
                type: typeMap[r.type] ?? r.type,
                assignedSponsors: (r.sponsors ?? []).map((rs: any) => ({
                    id: rs.sponsor.id,
                    name: rs.sponsor.organizationName,
                    email: rs.sponsor.user?.email ?? '',
                })),
                dueDate: r.dueDate
                    ? new Date(r.dueDate).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                    })
                    : '',
                status: statusMap[r.status] ?? 'pending',
                completionRate: 0,
                totalDocuments: 0,
                submittedDocuments: 0,
                priority: priorityMap[r.priority] ?? 'medium',
            }));
            setRequirements(mapped);
        }
    }, []);

    useEffect(() => {
        setIsHydrated(true);
        fetchData();
    }, [fetchData]);

    const filteredRequirements = requirements.filter((req) => {
        const matchesSearch =
            req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filters.status.length === 0 || filters.status.includes(req.status);
        const matchesPriority = filters.priority.length === 0 || filters.priority.includes(req.priority);
        const matchesType = filters.type.length === 0 || filters.type.includes(req.type);
        const matchesSponsors =
            filters.sponsors.length === 0 ||
            req.assignedSponsors.some((s) => filters.sponsors.includes(s.id));

        return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesSponsors;
    });

    const sortedRequirements = [...filteredRequirements].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof Requirement];
        let bValue: any = b[sortColumn as keyof Requirement];

        if (sortColumn === 'sponsors') {
            aValue = a.assignedSponsors.length;
            bValue = b.assignedSponsors.length;
        } else if (sortColumn === 'completion') {
            aValue = a.completionRate;
            bValue = b.completionRate;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const stats = {
        total: requirements.length,
        pending: requirements.filter((r) => r.status === 'pending').length,
        inProgress: requirements.filter((r) => r.status === 'in-progress').length,
        completed: requirements.filter((r) => r.status === 'completed').length,
        overdue: requirements.filter((r) => r.status === 'overdue').length,
        avgCompletion: requirements.length > 0
            ? Math.round(requirements.reduce((sum, r) => sum + r.completionRate, 0) / requirements.length)
            : 0,
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleSelectRequirement = (id: string) => {
        setSelectedRequirements((prev) =>
            prev.includes(id) ? prev.filter((reqId) => reqId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedRequirements.length === sortedRequirements.length) {
            setSelectedRequirements([]);
        } else {
            setSelectedRequirements(sortedRequirements.map((r) => r.id));
        }
    };

    const handleCreateRequirement = (_data: RequirementFormData) => {
        // Re-fetch requirements to include the newly created one from the server
        fetchData();
    };

    const handleEdit = (id: string) => {
        console.log('Edit requirement:', id);
    };

    const handleViewSubmissions = (id: string) => {
        router.push(`/tpa-dashboard/document-review?requirementId=${id}`);
    };

    const handleSendReminder = (id: string) => {
        console.log('Send reminder for:', id);
    };

    const handleDelete = (id: string) => {
        setRequirements(requirements.filter((r) => r.id !== id));
    };

    const handleBulkAssignSponsors = () => {
        console.log('Bulk assign sponsors to:', selectedRequirements);
    };

    const handleBulkUpdateDueDate = () => {
        console.log('Bulk update due date for:', selectedRequirements);
    };

    const handleBulkSendReminders = () => {
        console.log('Bulk send reminders for:', selectedRequirements);
    };

    const handleBulkDelete = () => {
        setRequirements(requirements.filter((r) => !selectedRequirements.includes(r.id)));
        setSelectedRequirements([]);
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background pt-16">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-muted rounded w-1/3" />
                        <div className="h-32 bg-muted rounded" />
                        <div className="h-96 bg-muted rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Requirements</span>
                        <Icon name="DocumentTextIcon" size={20} className="text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">In Progress</span>
                        <Icon name="ClockIcon" size={20} className="text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.inProgress}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <Icon name="CheckCircleIcon" size={20} className="text-success" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Overdue</span>
                        <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stats.overdue}</p>
                </div>
            </div>

            <div className="flex sm:flex-col md:flex-row gap-4">
                <div className="grow">
                    <div className="relative">
                        <Icon
                            name="MagnifyingGlassIcon"
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search requirements..."
                            className="w-full pl-12 pr-4 py-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'table' ? 'bg-card text-foreground' : 'text-muted-foreground'
                                }`}
                            aria-label="Table view"
                        >
                            <Icon name="TableCellsIcon" size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'grid' ? 'bg-card text-foreground' : 'text-muted-foreground'
                                }`}
                            aria-label="Grid view"
                        >
                            <Icon name="Squares2X2Icon" size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => modalBus.open("requirement")}
                        className="flex flex-1 justify-center items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
                    >
                        <Icon name="PlusIcon" size={20} />
                        <span className="font-medium">Create Requirement</span>
                    </button>
                </div>
            </div>

            <FilterPanel onFilterChange={setFilters} sponsors={sponsors} />

            {viewMode === 'table' ? (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <RequirementTable
                        requirements={sortedRequirements}
                        selectedRequirements={selectedRequirements}
                        onSelectRequirement={handleSelectRequirement}
                        onSelectAll={handleSelectAll}
                        onEdit={handleEdit}
                        onViewSubmissions={handleViewSubmissions}
                        onSendReminder={handleSendReminder}
                        onDelete={handleDelete}
                        onSort={handleSort}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                    />
                </div>
            ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedRequirements.map((requirement) => (
                        <RequirementCard
                            key={requirement.id}
                            requirement={requirement}
                            onEdit={handleEdit}
                            onViewSubmissions={handleViewSubmissions}
                            onSendReminder={handleSendReminder}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {sortedRequirements.length === 0 && (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Icon name="DocumentTextIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No requirements found</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setFilters({
                                status: [],
                                priority: [],
                                type: [],
                                sponsors: [],
                                dateRange: { start: '', end: '' },
                            });
                        }}
                        className="px-6 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-200"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            <BulkActionsBar
                selectedCount={selectedRequirements.length}
                onAssignSponsors={handleBulkAssignSponsors}
                onUpdateDueDate={handleBulkUpdateDueDate}
                onSendReminders={handleBulkSendReminders}
                onDelete={handleBulkDelete}
                onClearSelection={() => setSelectedRequirements([])}
            />
        </div>
    );
};

export default RequirementManagementInteractive;