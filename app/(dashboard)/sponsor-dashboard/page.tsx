import Header from "@/app/components/dashboard/header";
import SponsorDashboardInteractive from "@/app/components/dashboard/sponsor-dashboard/SponsorDashboardInteractive";

export default function SponsorDashboard() {
    return (
        <div className="min-h-screen bg-background">
      <div className="max-w-2/3 mx-auto px-6 py-8">
            <SponsorDashboardInteractive/>
        </div>
        </div>
    );
}