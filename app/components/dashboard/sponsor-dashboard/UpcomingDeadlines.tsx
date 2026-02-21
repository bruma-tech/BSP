'use client';
import Icon from '@/app/components/ui/AppIcon';


interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

const UpcomingDeadlines = ({ deadlines }: UpcomingDeadlinesProps) => {
  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-error',
      medium: 'text-warning',
      low: 'text-muted-foreground'
    };
    return colors[priority as keyof typeof colors];
  };

  const getUrgencyBadge = (days: number) => {
    if (days < 0) return { bg: 'bg-error/10', text: 'text-error', label: 'Overdue' };
    if (days <= 3) return { bg: 'bg-error/10', text: 'text-error', label: `${days}d left` };
    if (days <= 7) return { bg: 'bg-warning/10', text: 'text-warning', label: `${days}d left` };
    return { bg: 'bg-primary/10', text: 'text-primary', label: `${days}d left` };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Upcoming Deadlines</h2>
        <Icon name="CalendarDaysIcon" size={24} className="text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {deadlines.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="CheckCircleIcon" size={48} className="text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">All requirements are up to date!</p>
          </div>
        ) : (
          deadlines.map((deadline) => {
            const urgencyBadge = getUrgencyBadge(deadline.daysRemaining);
            return (
              <div
                key={deadline.id}
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors duration-fast"
              >
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(deadline.priority)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{deadline.title}</p>
                  <p className="text-xs text-muted-foreground">{deadline.dueDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyBadge.bg} ${urgencyBadge.text}`}>
                  {urgencyBadge.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;