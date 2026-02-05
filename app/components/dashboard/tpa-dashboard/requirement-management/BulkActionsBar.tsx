'use client';

import Icon from '@/app/components/ui/AppIcon';

interface BulkActionsBarProps {
    selectedCount: number;
    onAssignSponsors: () => void;
    onUpdateDueDate: () => void;
    onSendReminders: () => void;
    onDelete: () => void;
    onClearSelection: () => void;
}

const BulkActionsBar = ({
    selectedCount,
    onAssignSponsors,
    onUpdateDueDate,
    onSendReminders,
    onDelete,
    onClearSelection,
}: BulkActionsBarProps) => {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-lg shadow-xl px-6 py-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {selectedCount}
                </div>
                <span className="text-sm font-medium text-foreground">
                    {selectedCount} requirement{selectedCount > 1 ? 's' : ''} selected
                </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
                <button
                    onClick={onAssignSponsors}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                >
                    <Icon name="UserPlusIcon" size={18} />
                    <span className="text-sm font-medium">Assign Sponsors</span>
                </button>

                <button
                    onClick={onUpdateDueDate}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-200"
                >
                    <Icon name="CalendarIcon" size={18} />
                    <span className="text-sm font-medium">Update Due Date</span>
                </button>

                <button
                    onClick={onSendReminders}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground hover:bg-muted transition-colors duration-200"
                >
                    <Icon name="BellIcon" size={18} />
                    <span className="text-sm font-medium">Send Reminders</span>
                </button>

                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-error text-error hover:bg-error/10 transition-colors duration-200"
                >
                    <Icon name="TrashIcon" size={18} />
                    <span className="text-sm font-medium">Delete</span>
                </button>
            </div>

            <div className="h-6 w-px bg-border" />

            <button
                onClick={onClearSelection}
                className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
                aria-label="Clear selection"
            >
                <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
            </button>
        </div>
    );
};

export default BulkActionsBar;