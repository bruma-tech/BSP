'use client';
import Icon from '@/app/components/ui/AppIcon';


interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'feedback' | 'deadline';
  title: string;
  description: string;
  timestamp: string;
  requirementId?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityConfig = (type: string) => {
    const configs = {
      submission: { icon: 'ArrowUpTrayIcon', color: 'text-primary', bg: 'bg-primary/10' },
      approval: { icon: 'CheckCircleIcon', color: 'text-success', bg: 'bg-success/10' },
      rejection: { icon: 'XCircleIcon', color: 'text-error', bg: 'bg-error/10' },
      feedback: { icon: 'ChatBubbleLeftRightIcon', color: 'text-warning', bg: 'bg-warning/10' },
      deadline: { icon: 'BellAlertIcon', color: 'text-warning', bg: 'bg-warning/10' }
    };
    return configs[type as keyof typeof configs];
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-fast">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="InboxIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            return (
              <div key={activity.id} className="relative">
                {index !== activities.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />
                )}
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon name={config.icon as any} size={20} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;