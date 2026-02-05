import Header from "@/app/components/dashboard/header";

export default function SponsorDashboard() {
    return (
        <>
            <Header userRole="sponsor" userName="Admin User" notificationCount={3} />
        </>
    );
}