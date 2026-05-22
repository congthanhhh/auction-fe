import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";

export function AdminRoute() {
    const location = useLocation();
    const { isAuthenticated, isAdmin, isCheckingAdmin } = useAdminAuth();

    if (!isAuthenticated) {
        const redirectTo = `${location.pathname}${location.search}${location.hash}`;
        return <Navigate to={`/signin?redirectTo=${encodeURIComponent(redirectTo)}`} replace />;
    }

    if (isCheckingAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Checking admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <ShieldAlert className="size-6" />
                    </div>
                    <h1 className="text-2xl font-semibold">Admin access required</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your account does not have permission to open the admin dashboard.
                    </p>
                    <Button asChild className="mt-6">
                        <a href="/">Back to storefront</a>
                    </Button>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
