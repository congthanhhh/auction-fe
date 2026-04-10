import type { AuctionSessionResponse, AuctionStatus } from "@/types/auction";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface MyJoinedListProps {
    sessions: AuctionSessionResponse[];
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

export default function MyJoinedList({ sessions }: MyJoinedListProps) {
    const navigate = useNavigate();

    return (
        <div className="w-full">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-brand2">Phiên đã tham gia</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Bạn chưa tham gia phiên đấu giá nào. Hãy tham gia một phiên đấu giá để thấy danh sách tại đây.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã phiên</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Giá hiện tại</TableHead>
                                        <TableHead>Giá tối đa của tôi</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Bắt đầu</TableHead>
                                        <TableHead>Kết thúc</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const firstImage = session.product.images[0]?.url;

                                        return (
                                            <TableRow
                                                key={session.id}
                                                className="align-middle cursor-pointer hover:bg-muted/60"
                                                onClick={() => navigate(`/auction/${session.id}`)}
                                            >
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
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-medium text-foreground line-clamp-1">
                                                                {session.product.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Người bán: {session.product.seller.username}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-semibold">
                                                    {formatCurrency(session.currentPrice)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {session.myMaxBid != null ? formatCurrency(session.myMaxBid) : "--"}
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
