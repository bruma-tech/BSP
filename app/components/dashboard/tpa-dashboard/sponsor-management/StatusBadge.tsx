interface StatusBadgeProps {
    status: 'active' | 'pending' | 'inactive' | 'suspended';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        active: {
            label: 'Active',
            className: 'bg-success/10 text-success border-success/20'
        },
        pending: {
            label: 'Pending',
            className: 'bg-warning/10 text-warning border-warning/20'
        },
        inactive: {
            label: 'Inactive',
            className: 'bg-muted text-muted-foreground border-border'
        },
        suspended: {
            label: 'Suspended',
            className: 'bg-error/10 text-error border-error/20'
        }
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {config.label}
        </span>
    );
}