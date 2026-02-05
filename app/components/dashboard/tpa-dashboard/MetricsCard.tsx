interface MetricsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
    iconBgColor: string;
}

const MetricsCard = ({ title, value, change, changeType = 'neutral', icon, iconBgColor }: MetricsCardProps) => {
    const changeColors = {
        positive: 'text-success',
        negative: 'text-error',
        neutral: 'text-muted-foreground'
    };

    return (
        <div className="bg-card cursor-pointer border border-border rounded-lg p-6 hover:shadow-xl hover:scale-103 transition-all duration-fast">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
                    <p className="text-3xl font-semibold text-foreground mb-2">{value}</p>
                    {change && (
                        <p className={`text-sm font-medium ${changeColors[changeType]}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default MetricsCard;