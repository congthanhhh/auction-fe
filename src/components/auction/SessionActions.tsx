import { useTranslation } from "react-i18next";
import type { AuctionSessionResponse } from "@/types/auction";
import { Button } from "@/components/ui/button";
import { Ban, Eye, Loader2, RotateCcw } from "lucide-react";
import { EditSessionDialog } from "@/components/auction/EditSessionDialog";
import { canToggleSessionStatus, isStoppingSession } from "@/components/auction/session-list-utils";

interface SessionActionsProps {
    session: AuctionSessionResponse;
    bidCount: number;
    togglingId: number | null;
    compactLabels?: boolean;
    onView: (session: AuctionSessionResponse) => void;
    onToggleStatus?: (session: AuctionSessionResponse) => Promise<void> | void;
    onSessionUpdated?: () => Promise<void> | void;
}

export function SessionActions({
    session,
    bidCount,
    togglingId,
    compactLabels,
    onView,
    onToggleStatus,
    onSessionUpdated,
}: SessionActionsProps) {
    const { t } = useTranslation();
    const canToggle = canToggleSessionStatus(session);
    const isStopping = isStoppingSession(session);

    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onView(session)}>
                <Eye className="size-4" />
                {t("common.view")}
            </Button>
            {bidCount === 0 && (
                <EditSessionDialog session={session} disabled={false} onUpdated={onSessionUpdated} />
            )}
            {onToggleStatus && canToggle && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(session)}
                    disabled={togglingId === session.id}
                >
                    {togglingId === session.id ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : isStopping ? (
                        <Ban className="size-4" />
                    ) : (
                        <RotateCcw className="size-4" />
                    )}
                    {isStopping
                        ? t(compactLabels ? "auction.sessions.stop" : "auction.sessions.stopSession")
                        : t(compactLabels ? "auction.sessions.reopen" : "auction.sessions.reactivate")}
                </Button>
            )}
        </div>
    );
}
