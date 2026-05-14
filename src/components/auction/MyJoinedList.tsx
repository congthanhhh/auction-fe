import type { AuctionSessionResponse } from "@/types/auction";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { auctionStatusLabelKeys, auctionStatusVariants } from "@/types/auction-labels";
import { CalendarClock, ChevronRight, PackageSearch } from "lucide-react";

interface MyJoinedListProps {
    sessions: AuctionSessionResponse[];
}

function formatDateTime(value?: string | null) {
    return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "--";
}

function SessionImage({ session }: { session: AuctionSessionResponse }) {
    const firstImage = session.product.images[0]?.url;

    return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            {firstImage ? (
                <img
                    src={firstImage}
                    alt={session.product.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <PackageSearch className="m-auto mt-4 size-5 text-muted-foreground" />
            )}
        </div>
    );
}

export default function MyJoinedList({ sessions }: MyJoinedListProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (sessions.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground shadow-sm dark:bg-gray-900">
                {t("auction.joined.empty")}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-3 md:hidden">
                {sessions.map((session) => (
                    <button
                        key={session.id}
                        type="button"
                        onClick={() => navigate(`/auction/${session.id}`)}
                        className="rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40 dark:bg-gray-900 dark:hover:bg-emerald-950/20"
                    >
                        <div className="flex gap-3">
                            <SessionImage session={session} />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-foreground">{session.product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t("invoice.list.seller", { name: session.product.seller.username })}
                                        </p>
                                    </div>
                                    <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                </div>
                                <Badge
                                    variant="outline"
                                    className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}
                                >
                                    {t(auctionStatusLabelKeys[session.status])}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">{t("auction.sessions.currentPrice")}</p>
                                <p className="font-semibold">{formatCurrency(session.currentPrice)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t("auction.joined.maxBid")}</p>
                                <p className="font-semibold">
                                    {session.myMaxBid != null ? formatCurrency(session.myMaxBid) : "--"}
                                </p>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="size-4" />
                                <span>{formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-gray-900 md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("auction.sessions.sessionCode")}</TableHead>
                            <TableHead>{t("auction.sessions.product")}</TableHead>
                            <TableHead>{t("auction.sessions.currentPrice")}</TableHead>
                            <TableHead>{t("auction.joined.maxBid")}</TableHead>
                            <TableHead>{t("auction.sessions.status")}</TableHead>
                            <TableHead>{t("auction.sessions.start")}</TableHead>
                            <TableHead>{t("auction.sessions.end")}</TableHead>
                            <TableHead className="text-right">{t("auction.sessions.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => (
                            <TableRow key={session.id} className="align-middle hover:bg-muted/50">
                                <TableCell className="font-mono text-xs text-muted-foreground">#{session.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <SessionImage session={session} />
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="max-w-56 truncate text-sm font-medium text-foreground">
                                                {session.product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {t("invoice.list.seller", { name: session.product.seller.username })}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-semibold">{formatCurrency(session.currentPrice)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {session.myMaxBid != null ? formatCurrency(session.myMaxBid) : "--"}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}
                                    >
                                        {t(auctionStatusLabelKeys[session.status])}
                                    </Badge>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatDateTime(session.startTime)}
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatDateTime(session.endTime)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/auction/${session.id}`)}>
                                        {t("common.view")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
