'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RequirementCard from './RequirementCard'
import ProgressOverview from './ProgressOverview';
import UpcomingDeadlines from './UpcomingDeadlines';
import ActivityFeed from './ActivityFeed';
import NotificationAlerts from './NotificationAlerts'
import SearchFilter from './SearchFilter'

interface Requirement {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'overdue' | 'pending' | 'submitted' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  documentType: string;
  submittedDate?: string;
  reviewFeedback?: string;
  attachments?: number;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'feedback' | 'deadline';
  title: string;
  description: string;
  timestamp: string;
  requirementId?: string;
}

interface Notification {
  id: string;
  type: 'new_requirement' | 'deadline_approaching' | 'review_decision' | 'feedback_received';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

const SponsorDashboardInteractive = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);


  useEffect(() => {
    async function fetchRequirements() {
      try {
        const res = await fetch('/api/requirements');
        const json = await res.json();
        if (res.ok && json.success) {
          setRequirements(json.data);
          setFilteredRequirements(json.data);

          // Auto-generate notifications from real data
          const notifs: Notification[] = [];
          json.data.forEach((r: Requirement, i: number) => {
            if (r.status === 'overdue') {
              notifs.push({
                id: `notif-overdue-${r.id}`,
                type: 'deadline_approaching',
                title: 'Overdue Requirement',
                message: `"${r.title}" is overdue. Please submit immediately.`,
                timestamp: 'Recently',
                actionRequired: true,
              });
            }
            if (r.status === 'rejected') {
              notifs.push({
                id: `notif-rejected-${r.id}`,
                type: 'review_decision',
                title: 'Document Rejected',
                message: `"${r.title}" has been rejected. Review feedback and resubmit.`,
                timestamp: 'Recently',
                actionRequired: true,
              });
            }
          });
          setNotifications(notifs.slice(0, 3));
        }
      } catch {
        // fail silently — empty state shown
      } finally {
        setIsLoading(false);
      }
    }
    fetchRequirements();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-muted rounded" />
                <div className="h-48 bg-muted rounded" />
              </div>
              <div className="space-y-6">
                <div className="h-96 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalRequirements: requirements.length,
    completed: requirements.filter(r => r.status === 'approved').length,
    pending: requirements.filter(r => r.status === 'pending' || r.status === 'submitted').length,
    overdue: requirements.filter(r => r.status === 'overdue').length,
    completionRate: Math.round((requirements.filter(r => r.status === 'approved').length / requirements.length) * 100)
  };

  const upcomingDeadlines: Deadline[] = requirements
    .filter(r => r.status !== 'approved')
    .map(r => {
      const dueDate = new Date(r.dueDate);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: r.id,
        title: r.title,
        dueDate: r.dueDate,
        daysRemaining,
        priority: r.priority,
        status: r.status
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  const recentActivities: Activity[] = [
    {
      id: 'act-001',
      type: 'rejection',
      title: 'Document Rejected',
      description: 'Tax Documentation 2024 was rejected due to missing signature',
      timestamp: '5 hours ago',
      requirementId: 'req-004'
    },
    {
      id: 'act-002',
      type: 'submission',
      title: 'Document Submitted',
      description: 'Employee Benefits Summary has been submitted for review',
      timestamp: '1 day ago',
      requirementId: 'req-003'
    },
    {
      id: 'act-003',
      type: 'approval',
      title: 'Document Approved',
      description: 'Insurance Policy Verification has been approved',
      timestamp: '2 days ago',
      requirementId: 'req-005'
    },
    {
      id: 'act-004',
      type: 'deadline',
      title: 'Deadline Alert',
      description: 'Q4 2024 Financial Statement is now overdue',
      timestamp: '3 days ago',
      requirementId: 'req-001'
    },
    {
      id: 'act-005',
      type: 'feedback',
      title: 'Feedback Received',
      description: 'TPA has provided feedback on Tax Documentation 2024',
      timestamp: '5 days ago',
      requirementId: 'req-004'
    }
  ];

  const handleSearch = (query: string) => {
    let filtered = requirements.filter(req =>
      req.title.toLowerCase().includes(query.toLowerCase()) ||
      req.documentType.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRequirements(filtered);
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...requirements];

    if (filters.status.length > 0) {
      filtered = filtered.filter(req => filters.status.includes(req.status));
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(req => filters.priority.includes(req.priority));
    }

    if (filters.documentType.length > 0) {
      filtered = filtered.filter(req => filters.documentType.includes(req.documentType));
    }

    if (filters.dateRange !== 'all') {
      const today = new Date('2024-12-16');
      filtered = filtered.filter(req => {
        const dueDate = new Date(req.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.dateRange === 'today') return daysUntilDue === 0;
        if (filters.dateRange === 'week') return daysUntilDue >= 0 && daysUntilDue <= 7;
        if (filters.dateRange === 'month') return daysUntilDue >= 0 && daysUntilDue <= 30;
        return true;
      });
    }

    setFilteredRequirements(filtered);
  };

  const handleUpload = (id: string) => {
    console.log('Upload document for requirement:', id);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/sponsor-dashboard/document-review?requirementId=${id}`);
  };

  const handleViewHistory = (id: string) => {
    router.push(`/sponsor-dashboard/document-review?requirementId=${id}`);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleNotificationAction = (id: string) => {
    console.log('Take action for notification:', id);
  };

  return (
    <>
    <div className="space-y-6">
      {notifications.length > 0 && (
        <NotificationAlerts
          notifications={notifications}
          onDismiss={handleDismissNotification}
          onAction={handleNotificationAction}
        />
      )}

      <ProgressOverview stats={stats} />

      <SearchFilter onSearch={handleSearch} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Requirements ({filteredRequirements.length})
              </h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-fast">
                  Sort by: Due Date
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {filteredRequirements.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground">No requirements found matching your filters</p>
                </div>
              ) : (
                filteredRequirements.map(requirement => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    onUpload={handleUpload}
                    onViewDetails={handleViewDetails}
                    onViewHistory={handleViewHistory}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
    </>
  );
};

export default SponsorDashboardInteractive;