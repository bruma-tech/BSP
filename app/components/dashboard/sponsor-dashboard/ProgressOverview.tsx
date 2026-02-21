'use client';

interface ProgressOverviewProps {
  stats: {
    totalRequirements: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
}

const ProgressOverview = ({ stats }: ProgressOverviewProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Compliance Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-3xl font-bold text-foreground mb-1">{stats.totalRequirements}</p>
          <p className="text-sm text-muted-foreground">Total Requirements</p>
        </div>
        <div className="text-center p-4 bg-success/10 rounded-lg">
          <p className="text-3xl font-bold text-success mb-1">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <p className="text-3xl font-bold text-warning mb-1">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="text-center p-4 bg-error/10 rounded-lg">
          <p className="text-3xl font-bold text-error mb-1">{stats.overdue}</p>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Completion</span>
            <span className="text-sm font-bold text-primary">{stats.completionRate}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Approved Documents</span>
            <span className="text-sm font-bold text-success">
              {stats.completed}/{stats.totalRequirements}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${(stats.completed / stats.totalRequirements) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Pending Review</span>
            <span className="text-sm font-bold text-warning">
              {stats.pending}/{stats.totalRequirements}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning transition-all duration-500"
              style={{ width: `${(stats.pending / stats.totalRequirements) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;