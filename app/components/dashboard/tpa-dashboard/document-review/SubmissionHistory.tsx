import Icon from "@/app/components/ui/AppIcon";

interface HistoryItem {
    id: string;
    date: string;
    action: string;
    reviewer: string;
    comment: string;
    status: 'approved' | 'rejected' | 'submitted';
}

interface SubmissionHistoryProps {
    history: HistoryItem[];
}

const SubmissionHistory = ({ history }: SubmissionHistoryProps) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <Icon name="CheckCircleIcon" size={20} className="text-success" />;
            case 'rejected':
                return <Icon name="XCircleIcon" size={20} className="text-error" />;
            case 'submitted':
                return <Icon name="ArrowUpTrayIcon" size={20} className="text-primary" />;
            default:
                return <Icon name="ClockIcon" size={20} className="text-muted-foreground" />;
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Submission History</h3>
            <div className="space-y-4">
                {history.map((item, index) => (
                    <div key={item.id} className="relative">
                        {index !== history.length - 1 && (
                            <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-border" />
                        )}
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">{getStatusIcon(item.status)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">By {item.reviewer}</p>
                                {item.comment && (
                                    <div className="mt-2 p-3 bg-muted rounded-md">
                                        <p className="text-xs text-foreground">{item.comment}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubmissionHistory;