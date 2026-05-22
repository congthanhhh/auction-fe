import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export function AdminLoadingState({ title = "Loading data..." }: AdminStateProps) {
    return (
        <div className="flex min-h-52 items-center justify-center rounded-md border bg-background">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
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
        <div className="flex min-h-52 items-center justify-center rounded-md border bg-background px-4 text-center">
            <div>
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                    <Inbox className="size-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">{title}</p>
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
        <div className="flex min-h-52 items-center justify-center rounded-md border bg-background px-4 text-center">
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
