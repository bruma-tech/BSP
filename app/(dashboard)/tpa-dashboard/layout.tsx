import "@/app/components/global.css"
import { inter } from "@/app/components/ui/fonts";
import Header from "@/app/components/dashboard/header";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="max-w-7xl mx-6 px-6">
                <Header userRole="tpa" userName="Admin User" notificationCount={3} />
            </div>
            {children}
        </>
    );
}
