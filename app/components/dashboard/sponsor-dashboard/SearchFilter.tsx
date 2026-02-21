'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';


interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  status: string[];
  priority: string[];
  documentType: string[];
  dateRange: string;
}

const SearchFilter = ({ onSearch, onFilterChange }: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    documentType: [],
    dateRange: 'all'
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterToggle = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const newFilters = { ...filters, [category]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...filters, dateRange: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      documentType: [],
      dateRange: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = filters.status.length + filters.priority.length + filters.documentType.length + (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search requirements by title or document type..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors duration-fast text-sm font-medium text-foreground"
          >
            <Icon name="FunnelIcon" size={18} />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-md transition-colors duration-fast"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <div className="space-y-2">
              {['pending', 'submitted', 'approved', 'rejected', 'overdue'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleFilterToggle('status', status)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
            <div className="space-y-2">
              {['high', 'medium', 'low'].map((priority) => (
                <label key={priority} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority)}
                    onChange={() => handleFilterToggle('priority', priority)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
            <div className="space-y-2">
              {['Financial Statement', 'Compliance Report', 'Annual Report', 'Tax Document'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.documentType.includes(type)}
                    onChange={() => handleFilterToggle('documentType', type)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Due Date</label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Due Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    checked={filters.dateRange === option.value}
                    onChange={() => handleDateRangeChange(option.value)}
                    className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;