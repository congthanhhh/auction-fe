import { AlertCircle, CheckCircle2, Inbox, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export function AdminLoadingState({ title = "Loading data..." }: AdminStateProps) {
    return (
        <div className="flex min-h-52 items-center justify-center rounded-md border border-brand/15 bg-white dark:bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-brand" />
                {title}
            </div>
        </div>
    );
}

export function AdminEmptyState({
    title = "No records found",
    description = "There is no data to show for the current view.",
}: AdminStateProps) {
    return (
        <div className="flex min-h-52 items-center justify-center rounded-md border border-brand/15 bg-white px-4 text-center dark:bg-card">
            <div>
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand/10">
                    <Inbox className="size-5 text-brand" />
                </div>
                <p className="font-medium text-brand2 dark:text-brand">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export function AdminErrorState({
    title = "Could not load data",
    description = "Please try again or check whether this admin endpoint is available.",
    onRetry,
}: AdminStateProps) {
    return (
        <div className="flex min-h-52 items-center justify-center rounded-md border border-destructive/20 bg-white px-4 text-center dark:bg-card">
            <div>
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="size-5 text-destructive" />
                </div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                {onRetry && (
                    <Button className="mt-4" variant="outline" onClick={onRetry}>
                        Retry
                    </Button>
                )}
            </div>
        </div>
    );
}

interface AdminNoticeProps {
    tone?: "success" | "info" | "error";
    message: string | null;
}

export function AdminNotice({ tone = "info", message }: AdminNoticeProps) {
    if (!message) return null;

    const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;

    return (
        <div
            className={cn(
                "mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                tone === "info" && "border-border bg-muted text-muted-foreground",
                tone === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
            )}
        >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
