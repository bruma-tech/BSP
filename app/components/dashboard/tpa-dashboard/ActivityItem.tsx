import Icon from '@/app/components/ui/AppIcon';

interface ActivityItemProps {
    type: 'submission' | 'requirement' | 'approval' | 'rejection';
    title: string;
    description: string;
    timestamp: string;
    sponsor: string;
}

const ActivityItem = ({ type, title, description, timestamp, sponsor }: ActivityItemProps) => {
    const typeConfig = {
        submission: {
            icon: 'ArrowUpTrayIcon' as const,
            bgColor: 'bg-primary/10',
            iconColor: 'text-primary'
        },
        requirement: {
            icon: 'DocumentTextIcon' as const,
            bgColor: 'bg-accent/10',
            iconColor: 'text-accent'
        },
        approval: {
            icon: 'CheckCircleIcon' as const,
            bgColor: 'bg-success/10',
            iconColor: 'text-success'
        },
        rejection: {
            icon: 'XCircleIcon' as const,
            bgColor: 'bg-error/10',
            iconColor: 'text-error'
        }
    };

    const config = typeConfig[type];

    return (
        <div className="flex items-start cursor-pointer gap-4 p-4 border border-border hover:bg-muted/50 hover:scale-103 hover:border-primary hover:shadow-md rounded-lg transition-all duration-150">
            <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}>
                <Icon name={config.icon} size={20} className={config.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">{title}</p>
                <p className="text-sm text-muted-foreground mb-2">{description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Icon name="BuildingOfficeIcon" size={14} />
                        {sponsor}
                    </span>
                    <span className="flex items-center gap-1">
                        <Icon name="ClockIcon" size={14} />
                        {timestamp}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ActivityItem;