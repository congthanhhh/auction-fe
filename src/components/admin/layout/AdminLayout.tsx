import { Outlet, Link } from "react-router-dom";
import { Menu, Store, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "AD";

    return (
        <div className="min-h-screen bg-muted/30">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
                <AdminSidebar />
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
                    <div className="flex items-center gap-3">
                        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Admin navigation</SheetTitle>
                                </SheetHeader>
                                <AdminSidebar onNavigate={() => setIsMobileNavOpen(false)} />
                            </SheetContent>
                        </Sheet>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Admin Dashboard</p>
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Operational controls for auction workflows
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link to="/">
                                <Store className="size-4" />
                                Storefront
                            </Link>
                        </Button>
                        <div className="hidden items-center gap-2 rounded-md border px-2 py-1.5 sm:flex">
                            <Avatar className="size-7">
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="max-w-40">
                                <p className="truncate text-xs font-medium">{user?.username ?? "Admin"}</p>
                                <p className="truncate text-[11px] text-muted-foreground">{user?.role ?? "ADMIN"}</p>
                            </div>
                        </div>
                        <Button asChild variant="ghost" size="icon" className="sm:hidden">
                            <Link to="/profile">
                                <User className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
