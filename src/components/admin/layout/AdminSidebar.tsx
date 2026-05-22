import { NavLink } from "react-router-dom";
import {
    BarChart3,
    Boxes,
    FileWarning,
    Gavel,
    LayoutDashboard,
    ListChecks,
    Receipt,
    ScrollText,
    Settings,
    ShieldCheck,
    Tags,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/products", label: "Products", icon: Boxes },
    { to: "/admin/auctions", label: "Auctions", icon: Gavel },
    { to: "/admin/invoices", label: "Invoices", icon: Receipt },
    { to: "/admin/disputes", label: "Disputes", icon: FileWarning },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/roles", label: "Roles", icon: ShieldCheck },
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/logs", label: "Logs", icon: ScrollText },
];

interface AdminSidebarProps {
    onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
    return (
        <nav className="flex h-full flex-col bg-background">
            <div className="border-b px-5 py-4">
                <NavLink to="/admin" className="flex items-center gap-2 font-semibold text-foreground" onClick={onNavigate}>
                    <BarChart3 className="size-5 text-primary" />
                    Auction Admin
                </NavLink>
            </div>

            <div className="flex-1 space-y-1 px-3 py-4">
                {adminNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                                    isActive && "bg-accent text-foreground",
                                )
                            }
                        >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>

            <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <ListChecks className="size-4" />
                    Expandable admin console
                </div>
            </div>
        </nav>
    );
}
