'use client';

import { useState } from 'react';
import Icon from '@/app/components/ui/AppIcon';


interface Notification {
  id: string;
  type: 'new_requirement' | 'deadline_approaching' | 'review_decision' | 'feedback_received';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

interface NotificationAlertsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction: (id: string) => void;
}

const NotificationAlerts = ({ notifications, onDismiss, onAction }: NotificationAlertsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getNotificationConfig = (type: string) => {
    const configs = {
      new_requirement: { icon: 'DocumentPlusIcon', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
      deadline_approaching: { icon: 'ClockIcon', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
      review_decision: { icon: 'CheckBadgeIcon', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
      feedback_received: { icon: 'ChatBubbleLeftEllipsisIcon', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' }
    };
    return configs[type as keyof typeof configs];
  };

  if (notifications.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="BellAlertIcon" size={24} className="text-foreground" />
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          <span className="px-2 py-0.5 bg-error text-error-foreground text-xs font-medium rounded-full">
            {notifications.length}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-muted rounded-md transition-colors duration-fast"
          aria-label={isExpanded ? 'Collapse notifications' : 'Expand notifications'}
        >
          <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} className="text-muted-foreground" />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = getNotificationConfig(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-4 border ${config.border} ${config.bg} rounded-lg`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon name={config.icon as any} size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <button
                        onClick={() => onDismiss(notification.id)}
                        className="p-1 hover:bg-muted rounded transition-colors duration-fast"
                        aria-label="Dismiss notification"
                      >
                        <Icon name="XMarkIcon" size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                      {notification.actionRequired && (
                        <button
                          onClick={() => onAction(notification.id)}
                          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-fast"
                        >
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationAlerts;