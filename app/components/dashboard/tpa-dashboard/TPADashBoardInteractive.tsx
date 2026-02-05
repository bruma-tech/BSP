'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MetricsCard from './MetricsCard';
import ActivityItem from './ActivityItem';
import QuickActionButton from './QuickActionButton';
import Icon from '@/app/components/ui/AppIcon';
import SponsorTableRow from './SponsorTableRow';

interface Metric {
    id: string;
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
    iconBgColor: string;
}

interface Activity {
    id: number;
    type: 'submission' | 'requirement' | 'approval' | 'rejection';
    title: string;
    description: string;
    timestamp: string;
    sponsor: string;
}

interface Sponsor {
    id: number;
    name: string;
    planCount: number;
    pendingItems: number;
    lastActivity: string;
    status: 'active' | 'pending' | 'inactive';
}

const TPADashboardInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'pending' | 'activity'>('name');

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const metrics: Metric[] = [
        {
            id: '1',
            title: 'Total Sponsors',
            value: 8,
            change: '+12% from last month',
            changeType: 'positive',
            icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
            iconBgColor: 'bg-primary'
        },
        {
            id: '2',
            title: 'Active Requirements',
            value: 34,
            change: '23 due this week',
            changeType: 'negative',
            icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
            iconBgColor: 'bg-accent'
        },
        {
            id: '3',
            title: 'Pending Documents',
            value: 12,
            change: '-8% from last week',
            changeType: 'positive',
            icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
            iconBgColor: 'bg-warning'
        },
        {
            id: '4',
            title: 'Completion Rate',
            value: '64%',
            change: '+3% improvement',
            changeType: 'positive',
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            iconBgColor: 'bg-success'
        }
    ];

    const activities: Activity[] = [
        {
            id: 1,
            type: 'submission',
            title: 'New Document Submitted',
            description: 'Annual Financial Report Q4 2024 uploaded for review',
            timestamp: '5 minutes ago',
            sponsor: 'Acme Corporation'
        },
        {
            id: 2,
            type: 'approval',
            title: 'Document Approved',
            description: 'Compliance Certificate has been approved and closed',
            timestamp: '1 hour ago',
            sponsor: 'Global Enterprises'
        },
        {
            id: 3,
            type: 'requirement',
            title: 'New Requirement Created',
            description: 'Q1 2025 Tax Documentation requirement assigned',
            timestamp: '2 hours ago',
            sponsor: 'Tech Solutions Inc'
        },
        {
            id: 4,
            type: 'rejection',
            title: 'Document Rejected',
            description: 'Insurance Policy document requires resubmission',
            timestamp: '3 hours ago',
            sponsor: 'Healthcare Partners'
        },
        {
            id: 5,
            type: 'submission',
            title: 'Document Resubmitted',
            description: 'Updated Audit Report with corrections uploaded',
            timestamp: '4 hours ago',
            sponsor: 'Finance Group LLC'
        }
    ];

    const sponsors: Sponsor[] = [
        { id: 1, name: 'Acme Corporation', planCount: 3, pendingItems: 5, lastActivity: '5 minutes ago', status: 'active' },
        { id: 2, name: 'Global Enterprises', planCount: 2, pendingItems: 0, lastActivity: '1 hour ago', status: 'active' },
        { id: 3, name: 'Tech Solutions Inc', planCount: 4, pendingItems: 8, lastActivity: '2 hours ago', status: 'active' },
        { id: 4, name: 'Healthcare Partners', planCount: 1, pendingItems: 3, lastActivity: '3 hours ago', status: 'pending' },
        { id: 5, name: 'Finance Group LLC', planCount: 2, pendingItems: 2, lastActivity: '4 hours ago', status: 'active' },
        { id: 6, name: 'Retail Ventures', planCount: 3, pendingItems: 0, lastActivity: '1 day ago', status: 'active' },
        { id: 7, name: 'Manufacturing Co', planCount: 1, pendingItems: 12, lastActivity: '2 days ago', status: 'pending' },
        { id: 8, name: 'Education Trust', planCount: 2, pendingItems: 0, lastActivity: '3 days ago', status: 'inactive' }
    ];

    const handleQuickAction = (action: string) => {
        console.log(`Quick action: ${action}`);
    };

    const handleSponsorClick = (sponsorId: number) => {
        console.log(`Navigate to sponsor: ${sponsorId}`);
    };

    const filteredSponsors = sponsors
        .filter(sponsor => {
            const matchesSearch = sponsor.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || sponsor.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'pending') return b.pendingItems - a.pendingItems;
            return 0;
        });

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background pt-16">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-muted rounded w-1/4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-muted rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2/3 mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-foreground mb-2">TPA Dashboard</h1>
                    <p className="text-muted-foreground">Monitor sponsor relationships and document workflow status</p>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metrics.map(metric => (
                        <MetricsCard key={metric.id} {...metric} />
                    ))}
                </div>

                <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                            <Link href="/document-review" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-fast">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {activities.map(activity => (
                                <ActivityItem key={activity.id} {...activity} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
                        <div className="space-y-3">
                            <QuickActionButton
                                icon="UserPlusIcon"
                                label="Add New Sponsor"
                                description="Onboard a new sponsor entity"
                                onClick={() => handleQuickAction('add-sponsor')}
                            />
                            <QuickActionButton
                                icon="DocumentPlusIcon"
                                label="Create Requirement"
                                description="Assign new document requirement"
                                onClick={() => handleQuickAction('create-requirement')}
                            />
                            <QuickActionButton
                                icon="FolderPlusIcon"
                                label="Bulk Operations"
                                description="Manage multiple requirements"
                                onClick={() => handleQuickAction('bulk-operations')}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <div className="flex sm:flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-foreground">Sponsors Overview</h2>
                            <div className="flex sm:flex-row gap-3">
                                <div className="relative">
                                    <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search sponsors..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="pending">Sort by Pending</option>
                                    <option value="activity">Sort by Activity</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sponsor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Activity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-card">
                                {filteredSponsors.map(sponsor => (
                                    <SponsorTableRow
                                        key={sponsor.id}
                                        {...sponsor}
                                        onClick={() => handleSponsorClick(sponsor.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredSponsors.length === 0 && (
                        <div className="p-12 text-center">
                            <Icon name="MagnifyingGlassIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No sponsors found matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TPADashboardInteractive;