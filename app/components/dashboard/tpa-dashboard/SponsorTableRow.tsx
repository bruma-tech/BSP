import Icon from '@/app/components/ui/AppIcon';

interface SponsorTableRowProps {
    name: string;
    planCount: number;
    pendingItems: number;
    lastActivity: string;
    status: 'active' | 'pending' | 'inactive';
    onClick: () => void;
}

const SponsorTableRow = ({ name, planCount, pendingItems, lastActivity, status, onClick }: SponsorTableRowProps) => {
    const statusConfig = {
        active: { label: 'Active', color: 'bg-success/10 text-success' },
        pending: { label: 'Pending', color: 'bg-warning/10 text-warning' },
        inactive: { label: 'Inactive', color: 'bg-muted text-muted-foreground' }
    };

    const config = statusConfig[status];

    return (
        <tr className="border-b border-border hover:bg-muted/50 transition-colors duration-fast cursor-pointer" onClick={onClick} >
            <td className="px-6 py-4" >
                <div className="flex items-center gap-3" >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0" >
                        <Icon name="BuildingOfficeIcon" size={20} className="text-primary" />
                    </div>
                    < div >
                        <p className="text-sm font-medium text-foreground" > {name} </p>
                        < p className="text-xs text-muted-foreground" > {planCount} {planCount === 1 ? 'Plan' : 'Plans'} </p>
                    </div>
                </div>
            </td>
            < td className="px-6 py-4" >
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                </span>
            </td>
            < td className="px-6 py-4" >
                <div className="flex items-center gap-2" >
                    {pendingItems > 0 ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                            <span className="text-sm font-medium text-foreground" > {pendingItems} </span>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground" > None </span>
                    )}
                </div>
            </td>
            < td className="px-6 py-4" >
                <p className="text-sm text-muted-foreground" > {lastActivity} </p>
            </td>
            < td className="px-6 py-4" >
                <Icon name="ChevronRightIcon" size={20} className="text-muted-foreground" />
            </td>
        </tr>
    );
};

export default SponsorTableRow;