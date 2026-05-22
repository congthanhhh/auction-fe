export function formatAdminDate(value?: string | null): string {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export function formatAdminMoney(value?: number | null): string {
    if (typeof value !== "number") return "N/A";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatAdminBoolean(value?: boolean | null): string {
    if (typeof value !== "boolean") return "Unknown";
    return value ? "Active" : "Inactive";
}
