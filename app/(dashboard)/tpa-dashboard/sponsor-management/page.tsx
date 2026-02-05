import type { Metadata } from 'next';
import Header from '@/app/components/dashboard/header';
import Breadcrumb from '@/app/components/ui/BreadCrumb';
import SponsorManagementInteractive from '@/app/components/dashboard/tpa-dashboard/sponsor-management/SponsorManagementInteractive';

export const metadata: Metadata = {
    title: 'Sponsor Management - DocFlow Portal',
    description: 'Manage and oversee multiple sponsor entities, track onboarding progress, and coordinate document workflow activities across all managed sponsors.',
};

export default function SponsorManagementPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header userRole="tpa" userName="TPA Admin" notificationCount={3} />

            <main className="">
                <div className="max-w-2/3 mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-foreground mb-2">Sponsor Management</h1>
                        <p className="text-muted-foreground">
                            Manage sponsor entities, track onboarding progress, and oversee document workflows
                        </p>
                    </div>

                    <SponsorManagementInteractive />
                </div>
            </main>
        </div>
    );
}