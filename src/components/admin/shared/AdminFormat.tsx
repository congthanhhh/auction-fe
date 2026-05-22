import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { formatAdminBoolean } from "@/utils/admin-format";

interface AdminStatusBadgeProps {
    value?: string | boolean | null;
}

export function AdminStatusBadge({ value }: AdminStatusBadgeProps) {
    const label = typeof value === "boolean" ? formatAdminBoolean(value) : value ?? "Unknown";
    const normalized = String(label).toUpperCase();
    const variant =
        normalized.includes("ACTIVE") ||
        normalized.includes("PAID") ||
        normalized.includes("COMPLETED") ||
        normalized.includes("POSITIVE")
            ? "default"
            : normalized.includes("PENDING") ||
                normalized.includes("WAITING") ||
                normalized.includes("SCHEDULED") ||
                normalized.includes("DISPUTE")
              ? "secondary"
              : normalized.includes("REJECTED") ||
                  normalized.includes("CANCELLED") ||
                  normalized.includes("BANNED") ||
                  normalized.includes("FAILED")
                ? "destructive"
                : "outline";

    return <Badge variant={variant}>{label}</Badge>;
}

interface AdminDetailRowProps {
    label: string;
    children: ReactNode;
}

export function AdminDetailRow({ label, children }: AdminDetailRowProps) {
    return (
        <div className="grid gap-1 border-b py-3 last:border-b-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <div className="text-sm text-foreground">{children}</div>
        </div>
    );
}
