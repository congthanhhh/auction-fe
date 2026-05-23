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
import { useAdminAuth } from "@/hooks/use-admin-auth";

const adminNavItems = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true, permissionHints: ["ADMIN", "STATISTIC"] },
    { to: "/admin/users", label: "Users", icon: Users, permissionHints: ["USER"] },
    { to: "/admin/products", label: "Products", icon: Boxes, permissionHints: ["PRODUCT"] },
    { to: "/admin/auctions", label: "Auctions", icon: Gavel, permissionHints: ["AUCTION", "SESSION"] },
    { to: "/admin/invoices", label: "Invoices", icon: Receipt, permissionHints: ["INVOICE", "PAYMENT"] },
    { to: "/admin/disputes", label: "Disputes", icon: FileWarning, permissionHints: ["DISPUTE", "INVOICE"] },
    { to: "/admin/categories", label: "Categories", icon: Tags, permissionHints: ["CATEGORY"] },
    { to: "/admin/roles", label: "Roles", icon: ShieldCheck, permissionHints: ["ROLE", "PERMISSION"] },
    { to: "/admin/settings", label: "Settings", icon: Settings, permissionHints: ["SETTING"] },
    { to: "/admin/logs", label: "Logs", icon: ScrollText, permissionHints: ["LOG", "AUDIT"] },
];

interface AdminSidebarProps {
    onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
    const { permissions, user } = useAdminAuth();
    const normalizedRole = user?.role?.trim().toUpperCase();
    const isFullAdmin = normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
    const permissionNames = permissions.map((permission) => permission.name.toUpperCase());
    const visibleItems =
        isFullAdmin || permissionNames.length === 0
            ? adminNavItems
            : adminNavItems.filter((item) =>
                  item.permissionHints.some((hint) =>
                      permissionNames.some((permissionName) => permissionName.includes(hint)),
                  ),
              );

    return (
        <nav className="flex h-full flex-col bg-brand2 text-white">
            <div className="border-b border-white/15 px-5 py-4">
                <NavLink to="/admin" className="flex items-center gap-2 font-semibold tracking-wide text-white" onClick={onNavigate}>
                    <BarChart3 className="size-5 text-brand" />
                    Auction Admin
                </NavLink>
            </div>

            <div className="flex-1 space-y-1 px-3 py-4">
                {visibleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white",
                                    isActive && "bg-brand text-white shadow-sm",
                                )
                            }
                        >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>

            <div className="border-t border-white/15 px-4 py-3 text-xs text-white/65">
                <div className="flex items-center gap-2">
                    <ListChecks className="size-4 text-brand" />
                    Expandable admin console
                </div>
            </div>
        </nav>
    );
}
