import { format } from "date-fns";
import type { AuctionSessionResponse } from "@/types/auction";

export function formatSessionDateTime(value?: string | null) {
    return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "--";
}

export function getDateTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 16) : "";
}

export function canToggleSessionStatus(session: AuctionSessionResponse) {
    return session.status === "ACTIVE" || session.status === "SCHEDULED" || session.status === "CANCELLED";
}

export function isStoppingSession(session: AuctionSessionResponse) {
    return session.status === "ACTIVE" || session.status === "SCHEDULED";
}
