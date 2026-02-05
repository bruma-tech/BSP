'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import CreateRequirementModal, { RequirementFormData } from './CreateRequirementModal';
import FilterPanel, { FilterState } from './FilterPanel'
import RequirementTable from './RequirementTable';
import RequirementCard from './RequirementCard';
import BulkActionsBar from './BulkActionsBar';


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

const RequirementManagementInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
    const [sortColumn, setSortColumn] = useState('title');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filters, setFilters] = useState<FilterState>({
        status: [],
        priority: [],
        type: [],
        sponsors: [],
        dateRange: { start: '', end: '' },
    });

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const mockSponsors: Sponsor[] = [
        { id: 'sp1', name: 'Acme Corporation', email: 'contact@acme.com' },
        { id: 'sp2', name: 'Global Industries', email: 'info@globalind.com' },
        { id: 'sp3', name: 'TechStart Solutions', email: 'hello@techstart.com' },
        { id: 'sp4', name: 'Premier Healthcare', email: 'admin@premierhc.com' },
        { id: 'sp5', name: 'Sunrise Financial', email: 'support@sunrisefin.com' },
    ];

    const mockRequirements: Requirement[] = [
        {
            id: 'req1',
            title: 'Q4 2024 Financial Statement',
            description: 'Submit comprehensive financial statements for the fourth quarter of 2024 including balance sheet, income statement, and cash flow analysis.',
            type: 'Financial Report',
            assignedSponsors: [mockSponsors[0], mockSponsors[1]],
            dueDate: '12/31/2024',
            status: 'in-progress',
            completionRate: 65,
            totalDocuments: 3,
            submittedDocuments: 2,
            priority: 'high',
        },
        {
            id: 'req2',
            title: 'Annual Compliance Audit Report',
            description: 'Complete annual compliance audit documentation covering all regulatory requirements and internal policy adherence.',
            type: 'Compliance Document',
            assignedSponsors: [mockSponsors[2]],
            dueDate: '01/15/2025',
            status: 'pending',
            completionRate: 0,
            totalDocuments: 5,
            submittedDocuments: 0,
            priority: 'high',
        },
        {
            id: 'req3',
            title: 'Employee Benefits Plan Document',
            description: 'Updated employee benefits plan documentation reflecting changes in coverage and contribution rates.',
            type: 'Plan Document',
            assignedSponsors: [mockSponsors[3], mockSponsors[4]],
            dueDate: '01/30/2025',
            status: 'in-progress',
            completionRate: 40,
            totalDocuments: 2,
            submittedDocuments: 1,
            priority: 'medium',
        },
        {
            id: 'req4',
            title: '2024 Tax Filing Documents',
            description: 'All required tax filing documents including Form 5500, Schedule A, and supporting documentation.',
            type: 'Tax Filing',
            assignedSponsors: [mockSponsors[0]],
            dueDate: '12/20/2024',
            status: 'overdue',
            completionRate: 30,
            totalDocuments: 4,
            submittedDocuments: 1,
            priority: 'high',
        },
        {
            id: 'req5',
            title: 'Investment Policy Statement',
            description: 'Updated investment policy statement outlining investment objectives, strategies, and guidelines.',
            type: 'Plan Document',
            assignedSponsors: [mockSponsors[1], mockSponsors[2]],
            dueDate: '02/15/2025',
            status: 'pending',
            completionRate: 0,
            totalDocuments: 1,
            submittedDocuments: 0,
            priority: 'medium',
        },
        {
            id: 'req6',
            title: 'Quarterly Performance Report',
            description: 'Detailed quarterly performance analysis including key metrics, trends, and comparative data.',
            type: 'Financial Report',
            assignedSponsors: [mockSponsors[4]],
            dueDate: '11/30/2024',
            status: 'completed',
            completionRate: 100,
            totalDocuments: 2,
            submittedDocuments: 2,
            priority: 'low',
        },
    ];

    const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);

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
        avgCompletion: Math.round(
            requirements.reduce((sum, r) => sum + r.completionRate, 0) / requirements.length
        ),
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

    const handleCreateRequirement = (data: RequirementFormData) => {
        const newRequirement: Requirement = {
            id: `req${requirements.length + 1}`,
            title: data.title,
            description: data.description,
            type: data.type,
            assignedSponsors: mockSponsors.filter((s) => data.assignedSponsors.includes(s.id)),
            dueDate: new Date(data.dueDate).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            }),
            status: 'pending',
            completionRate: 0,
            totalDocuments: 1,
            submittedDocuments: 0,
            priority: data.priority,
        };

        setRequirements([newRequirement, ...requirements]);
        setIsCreateModalOpen(false);
    };

    const handleEdit = (id: string) => {
        console.log('Edit requirement:', id);
    };

    const handleViewSubmissions = (id: string) => {
        console.log('View submissions for:', id);
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
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex flex-1 justify-center items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground hover:cursor-pointer hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
                    >
                        <Icon name="PlusIcon" size={20} />
                        <span className="font-medium">Create Requirement</span>
                    </button>
                </div>
            </div>

            <FilterPanel onFilterChange={setFilters} sponsors={mockSponsors} />

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

            <CreateRequirementModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateRequirement}
                sponsors={mockSponsors}
            />
        </div>
    );
};

export default RequirementManagementInteractive;