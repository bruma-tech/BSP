import Icon from '@/app/components/ui/AppIcon';
interface QuickActionButtonProps {
    icon: 'UserPlusIcon' | 'DocumentPlusIcon' | 'FolderPlusIcon';
    label: string;
    description: string;
    onClick: () => void;
}

const QuickActionButton = ({ icon, label, description, onClick }: QuickActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-start cursor-pointer gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 hover:border-primary hover:shadow-md hover:scale-105 transition-all duration-100 text-left group"
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