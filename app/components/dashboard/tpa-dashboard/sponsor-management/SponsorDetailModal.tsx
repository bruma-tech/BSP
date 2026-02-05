'use client';

import { useEffect } from 'react';
import Icon from '@/app/components/ui/AppIcon';
import StatusBadge from './StatusBadge';

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

interface Plan {
    id: number;
    name: string;
    type: string;
    participants: number;
    status: string;
}

interface Requirement {
    id: number;
    title: string;
    dueDate: string;
    status: string;
    submittedDate?: string;
}

interface SponsorDetailModalProps {
    sponsor: Sponsor | null;
    onClose: () => void;
}

export default function SponsorDetailModal({ sponsor, onClose }: SponsorDetailModalProps) {
    useEffect(() => {
        if (sponsor) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sponsor]);

    if (!sponsor) return null;

    const mockPlans: Plan[] = [
        { id: 1, name: '401(k) Retirement Plan', type: 'Defined Contribution', participants: 250, status: 'Active' },
        { id: 2, name: 'Health Savings Account', type: 'HSA', participants: 180, status: 'Active' },
        { id: 3, name: 'Pension Plan', type: 'Defined Benefit', participants: 120, status: 'Active' }
    ];

    const mockRequirements: Requirement[] = [
        { id: 1, title: 'Q4 2024 Financial Statement', dueDate: '12/31/2024', status: 'Submitted', submittedDate: '12/15/2024' },
        { id: 2, title: 'Annual Compliance Report', dueDate: '01/15/2025', status: 'Pending', submittedDate: undefined },
        { id: 3, title: 'Participant Census Data', dueDate: '12/20/2024', status: 'Approved', submittedDate: '12/10/2024' }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg">
                            {sponsor.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{sponsor.name}</h2>
                            <p className="text-sm text-muted-foreground">Sponsor Details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} className="text-foreground" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Icon name="EnvelopeIcon" size={16} className="text-muted-foreground" />
                                    <span className="text-foreground">{sponsor.contactEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Icon name="PhoneIcon" size={16} className="text-muted-foreground" />
                                    <span className="text-foreground">{sponsor.contactPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Icon name="MapPinIcon" size={16} className="text-muted-foreground" />
                                    <span className="text-foreground">{sponsor.address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-foreground mb-3">Account Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <StatusBadge status={sponsor.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Registration Date</span>
                                    <span className="text-sm font-medium text-foreground">{sponsor.registrationDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last Activity</span>
                                    <span className="text-sm font-medium text-foreground">{sponsor.lastActivity}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                                    <span className="text-sm font-medium text-foreground">{sponsor.completionRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Associated Plans ({mockPlans.length})</h3>
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Plan Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Type</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">Participants</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {mockPlans.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-muted/50 transition-colors duration-fast">
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">{plan.name}</td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">{plan.type}</td>
                                                <td className="px-4 py-3 text-sm text-center text-foreground">{plan.participants}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                                                        {plan.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Requirements ({mockRequirements.length})</h3>
                        <div className="space-y-3">
                            {mockRequirements.map((req) => (
                                <div key={req.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow duration-fast">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-foreground mb-1">{req.title}</h4>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>Due: {req.dueDate}</span>
                                                {req.submittedDate && <span>Submitted: {req.submittedDate}</span>}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-success/10 text-success border border-success/20' :
                                            req.status === 'Submitted' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-warning/10 text-warning border border-warning/20'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-fast"
                    >
                        Close
                    </button>
                    <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-fast">
                        Edit Sponsor
                    </button>
                </div>
            </div>
        </div>
    );
}