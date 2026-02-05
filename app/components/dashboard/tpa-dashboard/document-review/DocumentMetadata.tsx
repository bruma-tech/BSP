import Icon from '@/app/components/ui/AppIcon';

interface DocumentMetadataProps {
    metadata: {
        submittedDate: string;
        sponsor: string;
        requirement: string;
        status: string;
        submissionCount: number;
        fileSize: string;
        format: string;
    };
}

const DocumentMetadata = ({ metadata }: DocumentMetadataProps) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending review':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'approved':
                return 'bg-success/10 text-success border-success/20';
            case 'rejected':
                return 'bg-error/10 text-error border-error/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Document Information</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Icon name="CalendarIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Submitted Date</p>
                            <p className="text-sm font-medium text-foreground">{metadata.submittedDate}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Icon name="BuildingOfficeIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Sponsor</p>
                            <p className="text-sm font-medium text-foreground">{metadata.sponsor}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Icon name="DocumentTextIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Requirement</p>
                            <p className="text-sm font-medium text-foreground">{metadata.requirement}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Icon name="ArrowPathIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Submission Count</p>
                            <p className="text-sm font-medium text-foreground">{metadata.submissionCount} submission(s)</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Icon name="DocumentIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">File Details</p>
                            <p className="text-sm font-medium text-foreground">{metadata.format} • {metadata.fileSize}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Icon name="FlagIcon" size={20} className="text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground">Current Status</p>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(metadata.status)} mt-1`}>
                                {metadata.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentMetadata;