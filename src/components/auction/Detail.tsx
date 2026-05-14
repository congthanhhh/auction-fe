import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Gavel, History, Loader2, Mail, MessageCircle, Phone, Printer, Share2, ShieldCheck, Star, TrendingUp, Trophy, UserRound } from "lucide-react";
import { useAuctionDetailStore } from "@/stores/auctionDetailStore";
import { useAuthStore } from "@/stores/authStore";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isBefore } from 'date-fns';
import { socketService } from "@/services/socketService";
import type { BidResponse, PriceUpdateData } from "@/types/auction";
import type { PublicUserProfileResponse } from "@/types/user";
import type { FeedbackDto, FeedbackRating } from "@/types/feedback";
import { formatCurrency } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { auctionService } from "@/services/auctionService";
import { userService } from "@/services/userService";
import { feedbackService } from "@/services/feedbackService";

const calculateTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);

    if (isBefore(now, end)) {
        const days = differenceInDays(end, now);
        const hours = differenceInHours(end, now) % 24;
        const minutes = differenceInMinutes(end, now) % 60;
        return `${days}d ${hours}h ${minutes}m`;
    }

    return "Ended";
};

// Handle bidTime coming from both REST (string) and Socket.IO (LocalDateTime array)
const parseBidTime = (raw: unknown): Date | null => {
    if (!raw) return null;

    if (raw instanceof Date) return raw;

    if (typeof raw === 'string' || typeof raw === 'number') {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }

    if (Array.isArray(raw)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = raw as number[];
        if (!year || !month || !day) return null;
        const d = new Date(year, month - 1, day, hour, minute, second);
        return isNaN(d.getTime()) ? null : d;
    }

    return null;
};

const getInitials = (value: string) =>
    value
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

const getBidderDisplayName = (bid: BidResponse) =>
    `${bid.user.firstName} ${bid.user.lastName}`.trim() || bid.user.username;

const formatBidTimestamp = (value: unknown) => {
    const bidDate = parseBidTime(value);
    return bidDate ? format(bidDate, 'dd/MM/yyyy HH:mm:ss') : '---';
};

const feedbackRatingLabels: Record<FeedbackRating, string> = {
    POSITIVE: "Tích cực",
    NEUTRAL: "Trung lập",
    NEGATIVE: "Tiêu cực",
};

const feedbackRatingClasses: Record<FeedbackRating, string> = {
    POSITIVE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    NEUTRAL: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    NEGATIVE: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) {
            return message;
        }
    }

    return fallback;
};

export default function Detail() {
    const { id } = useParams<{ id: string }>();
    const requireAuth = useRequireAuth();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const {
        auction,
        isLoading,
        error,
        fetchAuctionDetail,
        placeBid,
        bidHistory,
        bidCount,
        isPlacingBid,
        handleNewBid,
        handlePriceUpdate,
    } = useAuctionDetailStore();

    useEffect(() => {
        if (id) {
            fetchAuctionDetail(id);
            socketService.connect();
            const roomName = `session-${id}`;
            socketService.joinRoom(roomName);

            socketService.on<BidResponse>('new_bid', (newBid) => {
                console.log('New bid received:', newBid);
                handleNewBid(newBid);
            });

            socketService.on<PriceUpdateData>('price_update', (priceUpdate) => {
                console.log('Price update received:', priceUpdate);
                handlePriceUpdate(priceUpdate);
            });

            return () => {
                socketService.leaveRoom(roomName);
                socketService.off('new_bid');
                socketService.off('price_update');
                socketService.disconnect();
            };
        }
    }, [id, fetchAuctionDetail, handleNewBid, handlePriceUpdate]);


    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [maxBid, setMaxBid] = useState("");
    const [isBuying, setIsBuying] = useState(false);
    const [sellerProfile, setSellerProfile] = useState<PublicUserProfileResponse | null>(null);
    const [isSellerLoading, setIsSellerLoading] = useState(false);
    const [sellerError, setSellerError] = useState<string | null>(null);
    const [sellerFeedback, setSellerFeedback] = useState<FeedbackDto[]>([]);
    const [sellerFeedbackTotal, setSellerFeedbackTotal] = useState(0);
    const [isSellerFeedbackLoading, setIsSellerFeedbackLoading] = useState(false);
    const [sellerFeedbackError, setSellerFeedbackError] = useState<string | null>(null);

    useEffect(() => {
        const sellerId = auction?.product.seller.id;

        if (!sellerId) {
            setSellerProfile(null);
            setIsSellerLoading(false);
            setSellerError(null);
            return;
        }

        let shouldIgnore = false;

        const fetchSellerProfile = async () => {
            try {
                setIsSellerLoading(true);
                setSellerError(null);
                const profile = await userService.getPublicProfile(sellerId);

                if (!shouldIgnore) {
                    setSellerProfile(profile);
                }
            } catch (error) {
                console.error("Failed to load seller profile:", error);
                if (!shouldIgnore) {
                    setSellerError("Không thể tải thông tin người bán.");
                    setSellerProfile(null);
                }
            } finally {
                if (!shouldIgnore) {
                    setIsSellerLoading(false);
                }
            }
        };

        fetchSellerProfile();

        return () => {
            shouldIgnore = true;
        };
    }, [auction?.product.seller.id]);

    useEffect(() => {
        const sellerId = auction?.product.seller.id;

        if (!sellerId) {
            setSellerFeedback([]);
            setSellerFeedbackTotal(0);
            setSellerFeedbackError(null);
            setIsSellerFeedbackLoading(false);
            return;
        }

        let shouldIgnore = false;

        const fetchSellerFeedback = async () => {
            try {
                setIsSellerFeedbackLoading(true);
                setSellerFeedbackError(null);
                const response = await feedbackService.getPublicFeedback(sellerId, 1, 3);

                if (!shouldIgnore) {
                    setSellerFeedback(response.data ?? []);
                    setSellerFeedbackTotal(response.totalElements ?? 0);
                }
            } catch (error) {
                console.error("Failed to load seller feedback:", error);
                if (!shouldIgnore) {
                    setSellerFeedback([]);
                    setSellerFeedbackTotal(0);
                    setSellerFeedbackError("Không thể tải đánh giá người bán.");
                }
            } finally {
                if (!shouldIgnore) {
                    setIsSellerFeedbackLoading(false);
                }
            }
        };

        fetchSellerFeedback();

        return () => {
            shouldIgnore = true;
        };
    }, [auction?.product.seller.id]);

    const handlePlaceBid = () => {
        if (!id) return;

        const isAllowed = requireAuth();
        if (!isAllowed) return;

        if (!maxBid) return;

        placeBid(parseInt(id, 10), parseFloat(maxBid));
    };

    const handleBuyNow = async () => {
        if (!id) return;

        const isAllowed = requireAuth();
        if (!isAllowed) return;

        try {
            setIsBuying(true);
            const invoice = await auctionService.buyNow(Number(id));
            navigate(`/my-invoices/${invoice.id}`, { state: { invoice } });
        } catch (error: unknown) {
            console.error("Failed to buy now:", error);
            alert(getErrorMessage(error, "Không thể thực hiện mua ngay. Vui lòng thử lại."));
        } finally {
            setIsBuying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-10">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading auction details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-10">
                <Card className="mx-auto max-w-xl">
                    <CardContent className="pt-6 text-center text-destructive">
                        Error: {error.message}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="container mx-auto px-4 py-10">
                <Card className="mx-auto max-w-xl">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No auction data found.
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { product, startTime, endTime, currentPrice, startPrice, buyNowPrice, reservePriceMet, myMaxBid } = auction;
    const images = product.images.length > 0 ? product.images.map(img => img.url) : ["https://picsum.photos/200"];
    const timeLeft = calculateTimeLeft(endTime);
    const sellerName = sellerProfile
        ? `${sellerProfile.firstName} ${sellerProfile.lastName}`.trim() || sellerProfile.username
        : `${product.seller.firstName} ${product.seller.lastName}`.trim() || product.seller.username;
    const sellerInitials = getInitials(sellerName || product.seller.username);
    const sellerJoinedDate = sellerProfile?.createdAt
        ? format(new Date(sellerProfile.createdAt), 'dd/MM/yyyy')
        : null;
    const bidEntries = bidHistory?.data ?? [];
    const latestBid = bidEntries[0];
    const latestBidTime = latestBid ? formatBidTimestamp(latestBid.bidTime) : '--';
    const highestBidderName = auction.highestBidder
        ? `${auction.highestBidder.firstName} ${auction.highestBidder.lastName}`.trim() || auction.highestBidder.username
        : '--';
    const hasMoreBidHistory = bidHistory ? bidHistory.totalElements > bidEntries.length : false;


    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mx-auto max-w-6xl">
                <div className="grid w-full grid-cols-1 items-start gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
                    {/* Box 1 - Images */}
                    <div className="space-y-3">
                        <div className="aspect-4/3 flex w-full items-center justify-center overflow-hidden rounded-md border bg-muted">
                            <img
                                src={images[selectedImageIndex]}
                                alt="Auction item"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                                {images.map((img, index) => (
                                    <button
                                        key={img}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border transition sm:h-20 sm:w-24 ${selectedImageIndex === index
                                            ? "border-brand ring-2 ring-brand"
                                            : "border-muted-foreground/20"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Box 2 - Bid info */}
                    <div className="space-y-3">
                        <Card className="shadow-sm">
                            <CardHeader className="space-y-3">
                                <CardTitle className="text-xl font-bold leading-snug sm:text-2xl">
                                    {product.name}
                                </CardTitle>
                                <Separator />
                                <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Time left: <span className="font-bold">{timeLeft}</span>
                                    </span>
                                    <span>
                                        Bids: <span className="font-bold">{bidCount}</span>
                                    </span>
                                </CardDescription>
                                <Separator />
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex flex-col gap-1 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="text-xl font-bold">Current Price:</span>
                                        <span className="wrap-break-word text-xl font-bold text-gray-900 dark:text-white sm:text-right">
                                            {formatCurrency(currentPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-muted-foreground">
                                        <span>Start Price:</span>
                                        <span className="text-right">{formatCurrency(startPrice)}</span>
                                    </div>
                                    <div className={`flex items-center justify-between gap-3 ${reservePriceMet ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        <span>Reserve Price:</span>
                                        <span>{reservePriceMet ? 'Met' : 'Not Met'}</span>
                                    </div>
                                </div>

                                <Separator />

                                {buyNowPrice && (
                                    <>
                                        <div className="space-y-2 text-center">
                                            <span className="block text-base font-semibold sm:text-lg">Buy Now for {formatCurrency(buyNowPrice)}</span>
                                            <Button
                                                type="button"
                                                className="w-full mt-2 text-white bg-brand hover:bg-brand-hover"
                                                variant="outline"
                                                onClick={handleBuyNow}
                                                disabled={isBuying}
                                            >
                                                {isBuying ? "Processing..." : "Buy Now"}
                                            </Button>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                <div className="space-y-1">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                        <span className="text-lg font-semibold sm:text-xl">
                                            Set Your Maximum Bid:
                                        </span>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            value={maxBid ? formatCurrency(Number(maxBid)) : ""}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/[^0-9]/g, "");
                                                setMaxBid(raw);
                                            }}
                                            placeholder={formatCurrency(0)}
                                            className="w-full sm:w-44"
                                        />
                                    </div>
                                    {myMaxBid !== null && myMaxBid !== undefined && (
                                        <p className="text-left text-xs text-muted-foreground sm:text-right">
                                            Your current max bid: {formatCurrency(myMaxBid)}
                                        </p>
                                    )}

                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button
                                    className="h-12 w-full bg-fuchsia-800 text-base font-bold text-white hover:bg-fuchsia-700 sm:text-xl"
                                    size="lg"
                                    onClick={handlePlaceBid}
                                    disabled={isPlacingBid}
                                >
                                    {isPlacingBid ? 'Placing Bid...' : 'Place My Bid'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                            <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 hover:text-brand">
                                <MessageCircle className="h-4 w-4" />
                                <span>Contact Seller</span>
                            </button>
                            <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 hover:text-brand">
                                <Printer className="h-4 w-4" />
                                <span>Print Page</span>
                            </button>
                            <button type="button" className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 hover:text-brand">
                                <Share2 className="h-4 w-4" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="mx-auto mb-12 mt-8 w-full border-b pt-4">
                <Tabs defaultValue="itemInfo" className="w-full">
                    <TabsList className="flex h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border-b bg-transparent p-0 sm:justify-center sm:gap-10">
                        <TabsTrigger
                            value="itemInfo"
                            className="shrink-0 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent sm:text-lg"
                        >
                            Item Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="shipping"
                            className="shrink-0 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent sm:text-lg"
                        >
                            Shipping
                        </TabsTrigger>
                        <TabsTrigger
                            value="sellerInfo"
                            className="shrink-0 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent sm:text-lg"
                        >
                            Seller Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="bidHistory"
                            className="shrink-0 rounded-none border-b-2 border-transparent px-3 pb-2 pt-1 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent sm:text-lg"
                        >
                            Bid History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bidHistory" className="mx-auto mt-6 max-w-6xl sm:mt-8">
                        <Card className="overflow-hidden shadow-sm">
                            <CardHeader className="gap-4 border-b bg-muted/30 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/10 text-brand">
                                            <History className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <CardTitle className="text-xl">Lịch sử đấu giá</CardTitle>
                                            <CardDescription>
                                                {bidHistory?.totalElements ?? 0} lượt bid trong phiên này
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="w-fit gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Giá hiện tại: {formatCurrency(currentPrice)}
                                </Badge>
                            </CardHeader>

                            <CardContent className="space-y-5 p-4 sm:p-6">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-md border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Trophy className="h-4 w-4" />
                                            Người đang dẫn
                                        </div>
                                        <p className="truncate text-base font-semibold">{highestBidderName}</p>
                                    </div>
                                    <div className="rounded-md border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Gavel className="h-4 w-4" />
                                            Tổng lượt bid
                                        </div>
                                        <p className="text-base font-semibold">{bidHistory?.totalElements ?? bidCount}</p>
                                    </div>
                                    <div className="rounded-md border bg-background p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Lượt mới nhất
                                        </div>
                                        <p className="truncate text-base font-semibold">{latestBidTime}</p>
                                    </div>
                                </div>

                                {bidEntries.length === 0 ? (
                                    <div className="rounded-md border border-dashed p-8 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                            <Gavel className="h-6 w-6" />
                                        </div>
                                        <p className="font-semibold">Chưa có lượt bid nào</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Giá khởi điểm hiện tại là {formatCurrency(startPrice)}.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 md:hidden">
                                            {bidEntries.map((bid, index) => {
                                                const bidderName = getBidderDisplayName(bid);
                                                const isCurrentLeader =
                                                    auction.highestBidder?.id === bid.user.id &&
                                                    Number(bid.displayedAmount) === Number(currentPrice);
                                                const isMyBid =
                                                    currentUser?.id === bid.user.id ||
                                                    currentUser?.username === bid.user.username;

                                                return (
                                                    <div
                                                        key={bid.id}
                                                        className={`rounded-md border p-4 ${isCurrentLeader ? "border-brand/50 bg-brand/5" : "bg-background"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <p className="truncate font-semibold">{bidderName}</p>
                                                                    {isMyBid && <Badge variant="secondary">Bạn</Badge>}
                                                                    {isCurrentLeader && (
                                                                        <Badge className="bg-brand text-white hover:bg-brand">Đang dẫn đầu</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="mt-1 text-sm text-muted-foreground">@{bid.user.username}</p>
                                                            </div>
                                                            <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                                                #{index + 1}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 grid gap-3 text-sm">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className="text-muted-foreground">Giá hiển thị</span>
                                                                <span className="text-right font-semibold">{formatCurrency(bid.displayedAmount)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <span className="text-muted-foreground">Thời điểm</span>
                                                                <span className="text-right">{formatBidTimestamp(bid.bidTime)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="hidden overflow-x-auto rounded-md border md:block">
                                            <Table className="min-w-[760px]">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16">#</TableHead>
                                                        <TableHead>Người trả giá</TableHead>
                                                        <TableHead>Giá hiển thị</TableHead>
                                                        <TableHead>Trạng thái</TableHead>
                                                        <TableHead className="text-right">Thời điểm</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {bidEntries.map((bid, index) => {
                                                        const bidderName = getBidderDisplayName(bid);
                                                        const isCurrentLeader =
                                                            auction.highestBidder?.id === bid.user.id &&
                                                            Number(bid.displayedAmount) === Number(currentPrice);
                                                        const isMyBid =
                                                            currentUser?.id === bid.user.id ||
                                                            currentUser?.username === bid.user.username;

                                                        return (
                                                            <TableRow
                                                                key={bid.id}
                                                                className={isCurrentLeader ? "bg-brand/5" : undefined}
                                                            >
                                                                <TableCell className="font-medium text-muted-foreground">
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <span className="font-semibold">{bidderName}</span>
                                                                            {isMyBid && <Badge variant="secondary">Bạn</Badge>}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground">@{bid.user.username}</p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {formatCurrency(bid.displayedAmount)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isCurrentLeader ? (
                                                                        <Badge className="bg-brand text-white hover:bg-brand">Đang dẫn đầu</Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">Đã vượt qua</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right text-muted-foreground">
                                                                    {formatBidTimestamp(bid.bidTime)}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {hasMoreBidHistory && (
                                            <p className="text-center text-sm text-muted-foreground">
                                                Đang hiển thị {bidEntries.length} / {bidHistory?.totalElements} lượt gần nhất.
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="itemInfo" className="mx-auto mt-6 max-w-6xl sm:mt-8">
                        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8">
                            <div>
                                <div className="space-y-3 rounded-lg bg-muted p-4 text-sm sm:p-7 sm:text-base">
                                    <div className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                                        <span className="font-semibold text-foreground">Item ID:</span>
                                        <span className="wrap-break-word text-muted-foreground">{product.id}</span>
                                    </div>
                                    <div className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                                        <span className="font-semibold text-foreground">Number of Bids:</span>
                                        <span className="wrap-break-word text-muted-foreground">{bidCount} (High Bidder: {auction.highestBidder?.username || 'N/A'})</span>
                                    </div>
                                    <div className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                                        <span className="font-semibold text-foreground">Start time:</span>
                                        <span className="wrap-break-word text-muted-foreground">{format(new Date(startTime), 'dd/MM/yyyy HH:mm:ss')}</span>
                                    </div>
                                    <div className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                                        <span className="font-semibold text-foreground">Ends On:</span>
                                        <span className="wrap-break-word text-muted-foreground">{format(new Date(endTime), 'dd/MM/yyyy HH:mm:ss')}</span>
                                    </div>
                                    <div className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                                        <span className="font-semibold text-foreground">Seller:</span>
                                        <span className="wrap-break-word text-blue-600">{sellerName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Item Description</h3>
                                    <p className="whitespace-pre-line text-base leading-7 text-muted-foreground sm:text-lg">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">DISCLAIMER</h3>
                                    <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                                        Items are used, donated, and pre-owned. Condition may vary and all items are sold
                                        as-is.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="h-9 rounded-md border-primary text-primary"
                                    >
                                        View More
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="shipping" className="mx-auto mt-6 max-w-6xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Shipping</CardTitle>
                                <CardDescription>
                                    Shipping details will be confirmed after the auction is completed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                                <div className="rounded-md border p-4">
                                    <p className="font-medium text-foreground">Handling</p>
                                    <p>Seller will prepare the item after invoice confirmation.</p>
                                </div>
                                <div className="rounded-md border p-4">
                                    <p className="font-medium text-foreground">Payment</p>
                                    <p>Shipping information is managed from the invoice workflow.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="sellerInfo" className="mx-auto mt-6 max-w-6xl">
                        <Card>
                            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarFallback className="bg-brand/10 text-base font-bold text-brand">
                                            {sellerInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <CardTitle className="truncate text-xl">{sellerName}</CardTitle>
                                        <CardDescription className="truncate">@{sellerProfile?.username || product.seller.username}</CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="gap-1 self-start sm:self-center">
                                    <ShieldCheck className="h-3 w-3" />
                                    Public seller profile
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isSellerLoading && (
                                    <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading seller information...
                                    </div>
                                )}

                                {sellerError && (
                                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                        {sellerError}
                                    </div>
                                )}

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-md border p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <UserRound className="h-4 w-4" />
                                            Username
                                        </div>
                                        <p className="wrap-break-word font-semibold">{sellerProfile?.username || product.seller.username}</p>
                                    </div>
                                    <div className="rounded-md border p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Star className="h-4 w-4" />
                                            Reputation
                                        </div>
                                        <p className="font-semibold">{sellerProfile?.reputationScore ?? "--"}</p>
                                    </div>
                                    <div className="rounded-md border p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <CalendarDays className="h-4 w-4" />
                                            Joined
                                        </div>
                                        <p className="font-semibold">{sellerJoinedDate || "--"}</p>
                                    </div>
                                    <div className="rounded-md border p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            Phone
                                        </div>
                                        <p className="wrap-break-word font-semibold">{product.seller.phoneNumber || "--"}</p>
                                    </div>
                                </div>

                                <div className="rounded-md border p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        Contact email
                                    </div>
                                    <p className="wrap-break-word font-semibold">{product.seller.email || "--"}</p>
                                </div>

                                <div className="rounded-md border p-4">
                                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-base font-semibold">Đánh giá gần đây</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {sellerFeedbackTotal} đánh giá công khai cho người bán này
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="w-fit gap-1">
                                            <Star className="h-3.5 w-3.5" />
                                            {sellerProfile?.reputationScore ?? "--"} điểm uy tín
                                        </Badge>
                                    </div>

                                    {isSellerFeedbackLoading ? (
                                        <div className="flex items-center gap-2 rounded-md bg-muted/40 p-4 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tải đánh giá...
                                        </div>
                                    ) : sellerFeedbackError ? (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                                            {sellerFeedbackError}
                                        </div>
                                    ) : sellerFeedback.length > 0 ? (
                                        <div className="space-y-3">
                                            {sellerFeedback.map((feedback) => (
                                                <div key={feedback.id} className="rounded-md border bg-background p-3">
                                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold">@{feedback.fromUsername}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Vai trò: {feedback.reviewAs === "BUYER" ? "Người mua" : "Người bán"}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className={`w-fit ${feedbackRatingClasses[feedback.rating]}`}>
                                                            {feedbackRatingLabels[feedback.rating]}
                                                        </Badge>
                                                    </div>
                                                    <p className="whitespace-pre-line wrap-break-word text-sm text-muted-foreground">
                                                        {feedback.comment || "Không có nhận xét."}
                                                    </p>
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {feedback.createdAt ? format(new Date(feedback.createdAt), "dd/MM/yyyy HH:mm") : "--"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                            Người bán này chưa có đánh giá công khai.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
