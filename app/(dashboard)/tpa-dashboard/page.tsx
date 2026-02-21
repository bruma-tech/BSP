import TPADashboardInteractive from "@/app/components/dashboard/tpa-dashboard/TPADashBoardInteractive";
import { isTPAAuthorized } from "@/app/lib/dal";
import { redirect } from "next/navigation";

export default async function TpaDashboard() {
    const authorized = await isTPAAuthorized()
    if(!authorized){
        redirect("/")
    }
    return (
        <>
            <TPADashboardInteractive />
        </>
    );
}