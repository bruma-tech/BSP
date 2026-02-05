import "@/app/components/global.css"
import { inter } from "@/app/components/ui/fonts";
import Breadcrumb from "../components/ui/BreadCrumb";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="pt-16">
                <div className="max-w-7xl mx-6 px-6 py-6">
                    <Breadcrumb />
                </div>
            </div>
            {children}
        </>
    );
}
