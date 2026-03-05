'use client';

import { useState, useEffect } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import SponsorStats from './SponsorStats';
import SponsorTableRow from './SponsorTableRow';
import SponsorDetailModal from './SponsorDetailModal';
import AddSponsorModal from './AddSponsorModal';

interface Sponsor {
    id: number;
    name: string;
    status: 'active' | 'pending' | 'inactive' | 'suspended';
    planCount: number;
    activeRequirements: number;
    lastActivity: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    registrationDate: string;
    completionRate: number;
}

interface NewSponsor {
    name: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    status: 'active' | 'pending';
}

export default function SponsorManagementInteractive() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
    const [selectedSponsors, setSelectedSponsors] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<keyof Sponsor>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    useEffect(() => {
        async function fetchSponsors() {
            try {
                const res = await fetch('/api/sponsors');
                const json = await res.json();
                if (!res.ok || !json.success) throw new Error(json.message ?? 'Failed to fetch sponsors');
                setSponsors(json.data);
                setFilteredSponsors(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        }
        fetchSponsors();
    }, []);

    useEffect(() => {

        let result = [...sponsors];

        if (searchQuery) {
            result = result.filter(sponsor =>
                sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sponsor.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(sponsor => sponsor.status === statusFilter);
        }

        result.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        setFilteredSponsors(result);
    }, [searchQuery, statusFilter, sortField, sortDirection, sponsors]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                            <div className="h-10 w-10 bg-muted rounded-lg mb-3" />
                            <div className="h-8 bg-muted rounded mb-2" />
                            <div className="h-4 bg-muted rounded w-24" />
                        </div>
                    ))}
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="h-64 bg-muted rounded animate-pulse" />
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Icon name="ExclamationCircleIcon" size={48} className="text-error" />
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    const stats = {
        totalSponsors: sponsors.length,
        activeSponsors: sponsors.filter(s => s.status === 'active').length,
        pendingOnboarding: sponsors.filter(s => s.status === 'pending').length,
        completionRate: Math.round(
            sponsors.reduce((acc, s) => acc + s.completionRate, 0) / sponsors.length
        )
    };

    const handleSort = (field: keyof Sponsor) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleSelectSponsor = (id: number) => {
        setSelectedSponsors(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedSponsors.length === filteredSponsors.length) {
            setSelectedSponsors([]);
        } else {
            setSelectedSponsors(filteredSponsors.map(s => s.id));
        }
    };

    const handleBulkAction = () => {
        if (!bulkAction || selectedSponsors.length === 0) return;

        console.log(`Performing ${bulkAction} on sponsors:`, selectedSponsors);
        setSelectedSponsors([]);
        setBulkAction('');
    };

    const handleAddSponsor = (newSponsor: NewSponsor) => {
        const sponsor: Sponsor = {
            id: sponsors.length + 1,
            ...newSponsor,
            planCount: 0,
            activeRequirements: 0,
            lastActivity: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            registrationDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
            completionRate: 0
        };

        setSponsors(prev => [...prev, sponsor]);
    };

    return (
        <div className="space-y-6">
            <SponsorStats {...stats} />

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search sponsors by name or email..."
                                    className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>

                            <div className="flex gap-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    disabled={selectedSponsors.length === 0}
                                    className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Bulk Actions</option>
                                    <option value="activate">Activate</option>
                                    <option value="suspend">Suspend</option>
                                    <option value="export">Export</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction || selectedSponsors.length === 0}
                                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply
                                </button>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                disabled={true}
                                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icon name="PlusIcon" size={20} />
                                Add Sponsor
                            </button>
                        </div>
                    </div>

                    {selectedSponsors.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="CheckCircleIcon" size={18} className="text-primary" />
                            {selectedSponsors.length} sponsor{selectedSponsors.length !== 1 ? 's' : ''} selected
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedSponsors.length === filteredSponsors.length && filteredSponsors.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                                        aria-label="Select all sponsors"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <button
                                        onClick={() => handleSort('name')}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-fast"
                                    >
                                        Sponsor Name
                                        <Icon
                                            name={sortField === 'name' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                            size={16}
                                        />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-fast"
                                    >
                                        Status
                                        <Icon
                                            name={sortField === 'status' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                            size={16}
                                        />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-center">
                                    <button
                                        onClick={() => handleSort('planCount')}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-fast mx-auto"
                                    >
                                        Plans
                                        <Icon
                                            name={sortField === 'planCount' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                            size={16}
                                        />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-center">
                                    <button
                                        onClick={() => handleSort('activeRequirements')}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-fast mx-auto"
                                    >
                                        Requirements
                                        <Icon
                                            name={sortField === 'activeRequirements' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                            size={16}
                                        />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <button
                                        onClick={() => handleSort('lastActivity')}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider hover:text-primary transition-colors duration-fast"
                                    >
                                        Last Activity
                                        <Icon
                                            name={sortField === 'lastActivity' && sortDirection === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                                            size={16}
                                        />
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSponsors.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Icon name="FolderOpenIcon" size={48} className="text-muted-foreground" />
                                            <p className="text-muted-foreground">No sponsors found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSponsors.map((sponsor) => (
                                    <SponsorTableRow
                                        key={sponsor.id}
                                        sponsor={sponsor}
                                        isSelected={selectedSponsors.includes(sponsor.id)}
                                        onSelect={handleSelectSponsor}
                                        onEdit={(s) => console.log('Edit', s)}
                                        onViewPlans={(s) => console.log('View Plans', s)}
                                        onViewHistory={(s) => setSelectedSponsor(s)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {filteredSponsors.length} of {sponsors.length} sponsors</span>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Previous
                            </button>
                            <span className="px-3 py-1">Page 1 of 1</span>
                            <button className="px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <SponsorDetailModal
                sponsor={selectedSponsor}
                onClose={() => setSelectedSponsor(null)}
            />

            <AddSponsorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddSponsor}
            />
        </div>
    );
}