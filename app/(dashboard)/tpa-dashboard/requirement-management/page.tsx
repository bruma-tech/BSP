import type { Metadata } from 'next';
import RequirementManagementInteractive from '@/app/components/dashboard/tpa-dashboard/requirement-management/RequirementManagementInteractive';

export const metadata: Metadata = {
    title: 'Requirement Management - DocFlow Portal',
    description: 'Create, assign, and track document requirements across sponsor entities with comprehensive workflow management and real-time status monitoring.',
};

export default function RequirementManagementPage() {
    return (
        <div className="min-h-screen bg-background">

            <main className="">
                <div className="max-w-2/3 mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Requirement Management</h1>
                        <p className="text-muted-foreground">
                            Create, assign, and track document requirements across all sponsor entities
                        </p>
                    </div>
                    <RequirementManagementInteractive />
                </div>
            </main>
        </div>
    );
}