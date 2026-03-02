import Icon from '@/app/components/ui/AppIcon';
interface QuickActionButtonProps {
    icon: 'UserPlusIcon' | 'DocumentPlusIcon' | 'FolderPlusIcon';
    label: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}

const QuickActionButton = ({ icon, label, description, onClick , disabled = false}: QuickActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-start gap-4 p-4 bg-card border border-border rounded-lg transition-all duration-100 text-left group
                ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-muted/50 hover:border-primary hover:shadow-md hover:scale-105'
                }`}
        >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-50">
                <Icon name={icon} size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </button>
    );
};

export default QuickActionButton;