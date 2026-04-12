import type { AuctionSessionResponse, AuctionStatus } from "@/types/auction";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { auctionService } from "@/services/auctionService";

interface MySessionsListProps {
    sessions: AuctionSessionResponse[];
    onToggleStatus?: (session: AuctionSessionResponse) => void;
}

const auctionStatusLabels: Record<AuctionStatus, string> = {
    SCHEDULED: "Chưa bắt đầu",
    ACTIVE: "Đang diễn ra",
    ENDED: "Đã kết thúc",
    CANCELLED: "Đã hủy",
    FAILED: "Không thành công",
    WAITING_PAYMENT: "Chờ thanh toán",
};

const auctionStatusVariants: Record<AuctionStatus, string> = {
    SCHEDULED: "bg-slate-100 text-slate-800 border-slate-200",
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ENDED: "bg-zinc-100 text-zinc-800 border-zinc-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    FAILED: "bg-orange-100 text-orange-800 border-orange-200",
    WAITING_PAYMENT: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function MySessionsList({ sessions, onToggleStatus }: MySessionsListProps) {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-brand2">Phiên của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Bạn chưa tạo phiên đấu giá nào. Hãy tạo một phiên mới để thấy danh sách tại đây.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã phiên</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Giá khởi điểm</TableHead>
                                        <TableHead>Giá hiện tại</TableHead>
                                        <TableHead>Giá mua ngay</TableHead>
                                        <TableHead>Người thắng cuối cùng</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Bắt đầu</TableHead>
                                        <TableHead>Kết thúc</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const firstImage = session.product.images[0]?.url;
                                        const canToggleStatus =
                                            session.status === "ACTIVE" || session.status === "SCHEDULED" || session.status === "CANCELLED";
                                        const startInputValue = session.startTime ? session.startTime.slice(0, 16) : "";
                                        const endInputValue = session.endTime ? session.endTime.slice(0, 16) : "";

                                        return (
                                            <TableRow key={session.id} className="align-middle">
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    #{session.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {firstImage && (
                                                            <img
                                                                src={firstImage}
                                                                alt={session.product.name}
                                                                className="h-12 w-12 rounded-md object-cover border"
                                                            />
                                                        )}
                                                        <div className="space-y-0.5 w-35">
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/auction/${session.id}`)}
                                                                className="text-sm font-medium text-foreground truncate block w-full text-left hover:underline"
                                                            >
                                                                {session.product.name}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatCurrency(session.startPrice)}
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold">
                                                    {formatCurrency(session.currentPrice)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {session.buyNowPrice != null ? formatCurrency(session.buyNowPrice) : "--"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {session.status === "ENDED" || session.status === "WAITING_PAYMENT"
                                                        ? session.highestBidder
                                                            ? `${session.highestBidder.username}`
                                                            : "--"
                                                        : "--"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`border text-xs font-medium ${auctionStatusVariants[session.status]}`}
                                                    >
                                                        {auctionStatusLabels[session.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {session.startTime
                                                        ? format(new Date(session.startTime), "dd/MM/yyyy HH:mm")
                                                        : "--"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {session.endTime
                                                        ? format(new Date(session.endTime), "dd/MM/yyyy HH:mm")
                                                        : "--"}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                Chỉnh sửa
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <form
                                                                onSubmit={async (event: any) => {
                                                                    event.preventDefault();

                                                                    const form = event.currentTarget as HTMLFormElement;
                                                                    const formData = new FormData(form);

                                                                    const startTime = formData.get("startTime") as string | null;
                                                                    const endTime = formData.get("endTime") as string | null;
                                                                    const startPriceValue = formData.get("startPrice") as string | null;
                                                                    const reservePriceValue = formData.get("reservePrice") as string | null;
                                                                    const buyNowPriceValue = formData.get("buyNowPrice") as string | null;

                                                                    await auctionService.updateSession(session.id, {
                                                                        startTime: startTime && startTime.trim() !== "" ? startTime : null,
                                                                        endTime: endTime && endTime.trim() !== "" ? endTime : null,
                                                                        startPrice: startPriceValue && startPriceValue.trim() !== "" ? Number(startPriceValue) : null,
                                                                        reservePrice: reservePriceValue && reservePriceValue.trim() !== "" ? Number(reservePriceValue) : null,
                                                                        buyNowPrice: buyNowPriceValue && buyNowPriceValue.trim() !== "" ? Number(buyNowPriceValue) : null,
                                                                    });
                                                                }}
                                                                className="space-y-4"
                                                            >
                                                                <DialogHeader>
                                                                    <DialogTitle>Chỉnh sửa phiên đấu giá</DialogTitle>
                                                                    <DialogDescription>
                                                                        Điều chỉnh thời gian và mức giá cho phiên đấu giá này.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-muted-foreground">Sản phẩm</Label>
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {session.product.name}
                                                                        </p>
                                                                    </div>
                                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                                        <div className="space-y-1.5">
                                                                            <Label htmlFor={`startTime-${session.id}`}>Thời gian bắt đầu</Label>
                                                                            <Input
                                                                                id={`startTime-${session.id}`}
                                                                                name="startTime"
                                                                                type="datetime-local"
                                                                                defaultValue={startInputValue}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <Label htmlFor={`endTime-${session.id}`}>Thời gian kết thúc</Label>
                                                                            <Input
                                                                                id={`endTime-${session.id}`}
                                                                                name="endTime"
                                                                                type="datetime-local"
                                                                                defaultValue={endInputValue}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid gap-3 sm:grid-cols-3">
                                                                        <div className="space-y-1.5">
                                                                            <Label htmlFor={`startPrice-${session.id}`}>Giá khởi điểm</Label>
                                                                            <Input
                                                                                id={`startPrice-${session.id}`}
                                                                                name="startPrice"
                                                                                type="number"
                                                                                defaultValue={session.startPrice}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <Label htmlFor={`reservePrice-${session.id}`}>Giá chấp nhận bán</Label>
                                                                            <Input
                                                                                id={`reservePrice-${session.id}`}
                                                                                name="reservePrice"
                                                                                type="number"
                                                                                placeholder="Nhập giá chấp nhận bán"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1.5">
                                                                            <Label htmlFor={`buyNowPrice-${session.id}`}>Giá mua ngay</Label>
                                                                            <Input
                                                                                id={`buyNowPrice-${session.id}`}
                                                                                name="buyNowPrice"
                                                                                type="number"
                                                                                defaultValue={session.buyNowPrice ?? ""}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter showCloseButton>
                                                                    <Button type="submit">
                                                                        Lưu thay đổi
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    {onToggleStatus && canToggleStatus && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onToggleStatus(session)}
                                                        >
                                                            {session.status === "ACTIVE" || session.status === "SCHEDULED"
                                                                ? "Dừng phiên"
                                                                : "Kích hoạt lại"}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
