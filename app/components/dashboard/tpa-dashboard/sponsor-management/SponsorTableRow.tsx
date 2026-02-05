'use client';

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

interface SponsorTableRowProps {
    sponsor: Sponsor;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: (sponsor: Sponsor) => void;
    onViewPlans: (sponsor: Sponsor) => void;
    onViewHistory: (sponsor: Sponsor) => void;
}

export default function SponsorTableRow({
    sponsor,
    isSelected,
    onSelect,
    onEdit,
    onViewPlans,
    onViewHistory
}: SponsorTableRowProps) {
    return (
        <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-fast">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(sponsor.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                    aria-label={`Select ${sponsor.name}`}
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {sponsor.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-foreground">{sponsor.name}</div>
                        <div className="text-sm text-muted-foreground">{sponsor.contactEmail}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={sponsor.status} />
            </td>
            <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {sponsor.planCount}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    {sponsor.activeRequirements}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-muted-foreground">{sponsor.lastActivity}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(sponsor)}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="Edit sponsor"
                    >
                        <Icon name="PencilIcon" size={18} className="text-foreground" />
                    </button>
                    <button
                        onClick={() => onViewPlans(sponsor)}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="View plans"
                    >
                        <Icon name="DocumentTextIcon" size={18} className="text-foreground" />
                    </button>
                    <button
                        onClick={() => onViewHistory(sponsor)}
                        className="p-2 rounded-md hover:bg-muted transition-colors duration-fast"
                        aria-label="View history"
                    >
                        <Icon name="ClockIcon" size={18} className="text-foreground" />
                    </button>
                </div>
            </td>
        </tr>
    );
}