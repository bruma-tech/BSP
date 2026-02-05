interface SponsorStatsProps {
    totalSponsors: number;
    activeSponsors: number;
    pendingOnboarding: number;
    completionRate: number;
}

export default function SponsorStats({
    totalSponsors,
    activeSponsors,
    pendingOnboarding,
    completionRate
}: SponsorStatsProps) {
    const stats = [
        {
            label: 'Total Sponsors',
            value: totalSponsors,
            icon: '👥',
            color: 'bg-primary/10 text-primary'
        },
        {
            label: 'Active Sponsors',
            value: activeSponsors,
            icon: '✓',
            color: 'bg-success/10 text-success'
        },
        {
            label: 'Pending Onboarding',
            value: pendingOnboarding,
            icon: '⏳',
            color: 'bg-warning/10 text-warning'
        },
        {
            label: 'Completion Rate',
            value: `${completionRate}%`,
            icon: '📊',
            color: 'bg-accent/10 text-accent'
        }
    ];

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-fast"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-xl`}>
                            {stat.icon}
                        </div>
                    </div>
                    <div className="text-3xl font-semibold text-foreground mb-1">
                        {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}