'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';

interface FilterPanelProps {
    onFilterChange: (filters: FilterState) => void;
    sponsors: Array<{ id: string; name: string }>;
}

export interface FilterState {
    status: string[];
    priority: string[];
    type: string[];
    sponsors: string[];
    dateRange: {
        start: string;
        end: string;
    };
}

const FilterPanel = ({ onFilterChange, sponsors }: FilterPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        status: [],
        priority: [],
        type: [],
        sponsors: [],
        dateRange: { start: '', end: '' },
    });

    const statusOptions = ['pending', 'in-progress', 'completed', 'overdue'];
    const priorityOptions = ['low', 'medium', 'high'];
    const typeOptions = [
        'Financial Report',
        'Compliance Document',
        'Plan Document',
        'Audit Report',
        'Tax Filing',
        'Legal Document',
    ];

    const toggleFilter = (category: keyof Omit<FilterState, 'dateRange'>, value: string) => {
        setFilters((prev) => {
            const currentValues = prev[category] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            const newFilters = { ...prev, [category]: newValues };
            onFilterChange(newFilters);
            return newFilters;
        });
    };

    const updateDateRange = (field: 'start' | 'end', value: string) => {
        setFilters((prev) => {
            const newFilters = {
                ...prev,
                dateRange: { ...prev.dateRange, [field]: value },
            };
            onFilterChange(newFilters);
            return newFilters;
        });
    };

    const clearAllFilters = () => {
        const clearedFilters: FilterState = {
            status: [],
            priority: [],
            type: [],
            sponsors: [],
            dateRange: { start: '', end: '' },
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const activeFilterCount =
        filters.status.length +
        filters.priority.length +
        filters.type.length +
        filters.sponsors.length +
        (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

    return (
        <div className="bg-card border border-border rounded-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors duration-200"
            >
                <div className="flex items-center gap-3">
                    <Icon name="FunnelIcon" size={20} className="text-foreground" />
                    <span className="text-base font-semibold text-foreground">Advanced Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <Icon
                    name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={20}
                    className="text-muted-foreground"
                />
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-foreground">Status</label>
                            {filters.status.length > 0 && (
                                <button
                                    onClick={() => setFilters({ ...filters, status: [] })}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => toggleFilter('status', status)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${filters.status.includes(status)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {status.replace('-', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-foreground">Priority</label>
                            {filters.priority.length > 0 && (
                                <button
                                    onClick={() => setFilters({ ...filters, priority: [] })}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {priorityOptions.map((priority) => (
                                <button
                                    key={priority}
                                    onClick={() => toggleFilter('priority', priority)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${filters.priority.includes(priority)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {priority.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-foreground">Type</label>
                            {filters.type.length > 0 && (
                                <button
                                    onClick={() => setFilters({ ...filters, type: [] })}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {typeOptions.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => toggleFilter('type', type)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${filters.type.includes(type)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-foreground">Sponsors</label>
                            {filters.sponsors.length > 0 && (
                                <button
                                    onClick={() => setFilters({ ...filters, sponsors: [] })}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-border rounded-md p-2 bg-background">
                            {sponsors.map((sponsor) => (
                                <label
                                    key={sponsor.id}
                                    className="flex items-center gap-2 py-2 px-2 hover:bg-muted rounded-md cursor-pointer transition-colors duration-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.sponsors.includes(sponsor.id)}
                                        onChange={() => toggleFilter('sponsors', sponsor.id)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-foreground">{sponsor.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-3 block">Due Date Range</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="startDate" className="text-xs text-muted-foreground mb-1 block">
                                    From
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={filters.dateRange.start}
                                    onChange={(e) => updateDateRange('start', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="text-xs text-muted-foreground mb-1 block">
                                    To
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={filters.dateRange.end}
                                    onChange={(e) => updateDateRange('end', e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="w-full px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-200"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;