import { type FormEvent, useEffect, useState } from "react";
import type { AuctionSessionResponse } from "@/types/auction";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { auctionService } from "@/services/auctionService";
import { bidService } from "@/services/bidService";
import { auctionStatusLabels, auctionStatusVariants } from "@/types/auction-labels";
import { Ban, CalendarClock, ChevronRight, Eye, Loader2, PackageSearch, Pencil, RotateCcw, Save } from "lucide-react";

interface MySessionsListProps {
    sessions: AuctionSessionResponse[];
    onToggleStatus?: (session: AuctionSessionResponse) => Promise<void> | void;
    onSessionUpdated?: () => Promise<void> | void;
}

function formatDateTime(value?: string | null) {
    return value ? format(new Date(value), "dd/MM/yyyy HH:mm") : "--";
}

function getDateTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 16) : "";
}

function SessionImage({ session }: { session: AuctionSessionResponse }) {
    const firstImage = session.product.images[0]?.url;

    return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            {firstImage ? (
                <img src={firstImage} alt={session.product.name} className="h-full w-full object-cover" />
            ) : (
                <PackageSearch className="m-auto mt-4 size-5 text-muted-foreground" />
            )}
        </div>
    );
}

function EditSessionDialog({
    session,
    disabled,
    onUpdated,
}: {
    session: AuctionSessionResponse;
    disabled: boolean;
    onUpdated?: () => Promise<void> | void;
}) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const startTime = String(formData.get("startTime") ?? "");
        const endTime = String(formData.get("endTime") ?? "");
        const startPriceValue = String(formData.get("startPrice") ?? "");
        const reservePriceValue = String(formData.get("reservePrice") ?? "");
        const buyNowPriceValue = String(formData.get("buyNowPrice") ?? "");

        const parsedStartPrice = startPriceValue.trim() ? Number(startPriceValue) : null;
        const parsedReservePrice = reservePriceValue.trim() ? Number(reservePriceValue) : null;
        const parsedBuyNowPrice = buyNowPriceValue.trim() ? Number(buyNowPriceValue) : null;

        if (
            (parsedStartPrice != null && (!Number.isFinite(parsedStartPrice) || parsedStartPrice <= 0)) ||
            (parsedReservePrice != null && (!Number.isFinite(parsedReservePrice) || parsedReservePrice <= 0)) ||
            (parsedBuyNowPrice != null && (!Number.isFinite(parsedBuyNowPrice) || parsedBuyNowPrice <= 0))
        ) {
            setError("Các mức giá phải lớn hơn 0.");
            return;
        }

        if (
            startTime &&
            endTime &&
            (!Number.isFinite(new Date(startTime).getTime()) ||
                !Number.isFinite(new Date(endTime).getTime()) ||
                new Date(endTime) <= new Date(startTime))
        ) {
            setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
            return;
        }

        try {
            setIsSaving(true);
            await auctionService.updateSession(session.id, {
                startTime: startTime.trim() ? startTime : null,
                endTime: endTime.trim() ? endTime : null,
                startPrice: parsedStartPrice,
                reservePrice: parsedReservePrice,
                buyNowPrice: parsedBuyNowPrice,
            });
            await onUpdated?.();
            setOpen(false);
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as Error).message)
                    : "Không thể lưu thay đổi phiên đấu giá";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                    <Pencil className="size-4" />
                    Chỉnh sửa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa phiên đấu giá</DialogTitle>
                        <DialogDescription>
                            Chỉ nên thay đổi phiên khi chưa có lượt bid để tránh ảnh hưởng người tham gia.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Sản phẩm</Label>
                            <p className="text-sm font-medium text-foreground">{session.product.name}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor={`startTime-${session.id}`}>Thời gian bắt đầu</Label>
                                <Input
                                    id={`startTime-${session.id}`}
                                    name="startTime"
                                    type="datetime-local"
                                    defaultValue={getDateTimeInputValue(session.startTime)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`endTime-${session.id}`}>Thời gian kết thúc</Label>
                                <Input
                                    id={`endTime-${session.id}`}
                                    name="endTime"
                                    type="datetime-local"
                                    defaultValue={getDateTimeInputValue(session.endTime)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor={`startPrice-${session.id}`}>Giá khởi điểm</Label>
                                <Input id={`startPrice-${session.id}`} name="startPrice" type="number" min={1} defaultValue={session.startPrice} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`reservePrice-${session.id}`}>Giá chấp nhận bán</Label>
                                <Input id={`reservePrice-${session.id}`} name="reservePrice" type="number" min={1} placeholder="Tùy chọn" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`buyNowPrice-${session.id}`}>Giá mua ngay</Label>
                                <Input id={`buyNowPrice-${session.id}`} name="buyNowPrice" type="number" min={1} defaultValue={session.buyNowPrice ?? ""} />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Hủy</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Lưu
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function MySessionsList({ sessions, onToggleStatus, onSessionUpdated }: MySessionsListProps) {
    const navigate = useNavigate();

    const [bidCounts, setBidCounts] = useState<Record<number, number>>({});
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (sessions.length === 0) {
            setBidCounts({});
            return;
        }

        let isMounted = true;

        const fetchBidCounts = async () => {
            const uniqueProductIds = Array.from(new Set(sessions.map((session) => session.product.id)));
            const results = await Promise.allSettled(
                uniqueProductIds.map(async (productId) => ({
                    productId,
                    count: await bidService.getBidCount(productId),
                })),
            );

            if (!isMounted) return;

            setBidCounts((prev) => {
                const next = { ...prev };
                for (const result of results) {
                    if (result.status === "fulfilled") {
                        next[result.value.productId] = result.value.count;
                    }
                }
                return next;
            });
        };

        fetchBidCounts();

        return () => {
            isMounted = false;
        };
    }, [sessions]);

    const handleToggleStatus = async (session: AuctionSessionResponse) => {
        if (!onToggleStatus) return;
        setTogglingId(session.id);
        try {
            await onToggleStatus(session);
        } finally {
            setTogglingId(null);
        }
    };

    if (sessions.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground shadow-sm dark:bg-gray-900">
                Bạn chưa tạo phiên đấu giá nào phù hợp với bộ lọc hiện tại.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid gap-3 lg:hidden">
                {sessions.map((session) => {
                    const bidCount = bidCounts[session.product.id] ?? 0;
                    const canToggleStatus = session.status === "ACTIVE" || session.status === "SCHEDULED" || session.status === "CANCELLED";
                    const isStopping = session.status === "ACTIVE" || session.status === "SCHEDULED";

                    return (
                        <div key={session.id} className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900">
                            <div className="flex gap-3">
                                <SessionImage session={session} />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-foreground">{session.product.name}</p>
                                            <p className="text-xs text-muted-foreground">Lượt bid: {bidCount}</p>
                                        </div>
                                        <button type="button" onClick={() => navigate(`/auction/${session.id}`)} aria-label="Xem phiên">
                                            <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                        </button>
                                    </div>
                                    <Badge variant="outline" className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}>
                                        {auctionStatusLabels[session.status]}
                                    </Badge>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Giá khởi điểm</p>
                                    <p className="font-medium">{formatCurrency(session.startPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Giá hiện tại</p>
                                    <p className="font-semibold">{formatCurrency(session.currentPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Mua ngay</p>
                                    <p className="font-medium">{session.buyNowPrice != null ? formatCurrency(session.buyNowPrice) : "--"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Người thắng</p>
                                    <p className="truncate font-medium">{session.highestBidder?.username ?? "--"}</p>
                                </div>
                                <div className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <CalendarClock className="size-4" />
                                    <span>{formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/auction/${session.id}`)}>
                                    <Eye className="size-4" />
                                    Xem
                                </Button>
                                {bidCount === 0 && (
                                    <EditSessionDialog session={session} disabled={false} onUpdated={onSessionUpdated} />
                                )}
                                {onToggleStatus && canToggleStatus && (
                                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(session)} disabled={togglingId === session.id}>
                                        {togglingId === session.id ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : isStopping ? (
                                            <Ban className="size-4" />
                                        ) : (
                                            <RotateCcw className="size-4" />
                                        )}
                                        {isStopping ? "Dừng phiên" : "Kích hoạt lại"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm dark:bg-gray-900 lg:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã phiên</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Giá khởi điểm</TableHead>
                            <TableHead>Giá hiện tại</TableHead>
                            <TableHead>Mua ngay</TableHead>
                            <TableHead>Người thắng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Bắt đầu</TableHead>
                            <TableHead>Kết thúc</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => {
                            const bidCount = bidCounts[session.product.id] ?? 0;
                            const canToggleStatus = session.status === "ACTIVE" || session.status === "SCHEDULED" || session.status === "CANCELLED";
                            const isStopping = session.status === "ACTIVE" || session.status === "SCHEDULED";

                            return (
                                <TableRow key={session.id} className="align-middle hover:bg-muted/50">
                                    <TableCell className="font-mono text-xs text-muted-foreground">#{session.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <SessionImage session={session} />
                                            <div className="min-w-0 space-y-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/auction/${session.id}`)}
                                                    className="block max-w-52 truncate text-left text-sm font-medium text-foreground hover:underline"
                                                >
                                                    {session.product.name}
                                                </button>
                                                <p className="text-xs text-muted-foreground">Lượt bid: {bidCount}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatCurrency(session.startPrice)}</TableCell>
                                    <TableCell className="text-sm font-semibold">{formatCurrency(session.currentPrice)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {session.buyNowPrice != null ? formatCurrency(session.buyNowPrice) : "--"}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{session.highestBidder?.username ?? "--"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}>
                                            {auctionStatusLabels[session.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(session.startTime)}</TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(session.endTime)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/auction/${session.id}`)}>
                                                <Eye className="size-4" />
                                                Xem
                                            </Button>
                                            {bidCount === 0 && (
                                                <EditSessionDialog session={session} disabled={false} onUpdated={onSessionUpdated} />
                                            )}
                                            {onToggleStatus && canToggleStatus && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(session)}
                                                    disabled={togglingId === session.id}
                                                >
                                                    {togglingId === session.id ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : isStopping ? (
                                                        <Ban className="size-4" />
                                                    ) : (
                                                        <RotateCcw className="size-4" />
                                                    )}
                                                    {isStopping ? "Dừng" : "Mở lại"}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
