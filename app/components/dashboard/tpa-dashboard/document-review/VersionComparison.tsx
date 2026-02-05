'use client';

import { useState } from 'react';
import Icon from "@/app/components/ui/AppIcon";

interface Version {
    id: string;
    version: number;
    submittedDate: string;
    status: string;
    changes: string;
}

interface VersionComparisonProps {
    versions: Version[];
    onCompare: (versionId: string) => void;
}

const VersionComparison = ({ versions, onCompare }: VersionComparisonProps) => {
    const [selectedVersion, setSelectedVersion] = useState<string>('');

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-success/10 text-success border-success/20';
            case 'rejected':
                return 'bg-error/10 text-error border-error/20';
            case 'pending':
                return 'bg-warning/10 text-warning border-warning/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Version History</h3>
                <span className="text-xs text-muted-foreground">{versions.length} version(s)</span>
            </div>

            <div className="space-y-3">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className={`p-4 rounded-lg border transition-all duration-fast cursor-pointer ${selectedVersion === version.id
                                ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                        onClick={() => setSelectedVersion(version.id)}
                    >
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <Icon name="DocumentDuplicateIcon" size={18} className="text-primary" />
                                <span className="text-sm font-semibold text-foreground">Version {version.version}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(version.status)}`}>
                                {version.status}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{version.submittedDate}</p>
                        <p className="text-xs text-foreground">{version.changes}</p>
                    </div>
                ))}
            </div>

            {selectedVersion && (
                <button
                    onClick={() => onCompare(selectedVersion)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-fast"
                >
                    <Icon name="ArrowsRightLeftIcon" size={18} />
                    Compare with Current Version
                </button>
            )}
        </div>
    );
};

export default VersionComparison;