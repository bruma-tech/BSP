import "@/app/components/global.css"
import { inter } from "@/app/components/ui/fonts";
import Header from "@/app/components/dashboard/header";
import { getAuthenticatedUser } from "@/app/lib/dal";
import UnauthorizedModal from "@/app/components/UnauthorizedModal";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthenticatedUser();
    return (
        <>
            <UnauthorizedModal />
            <div className="max-w-7xl mx-6 px-6">
            <Header userRole={user.role as 'tpa' | 'sponsor'} userName={user.name} />
            </div>
            {children}
        </>
    );
}
