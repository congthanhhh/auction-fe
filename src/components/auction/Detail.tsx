import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Printer, Share2, MessageCircle } from "lucide-react";
import { useAuctionDetailStore } from "@/stores/auctionDetailStore";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isBefore } from 'date-fns';
import { socketService } from "@/services/socketService";
import type { BidResponse, PriceUpdateData } from "@/types/auction";
import { formatCurrency } from "@/lib/utils";
import { useRequireAuth } from "@/hooks/use-require-auth";

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

export default function Detail() {
    const { id } = useParams<{ id: string }>();
    const requireAuth = useRequireAuth();
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

    const handlePlaceBid = () => {
        if (!id) return;

        const isAllowed = requireAuth();
        if (!isAllowed) return;

        if (!maxBid) return;

        placeBid(parseInt(id, 10), parseFloat(maxBid));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!auction) {
        return <div>No auction data found.</div>;
    }

    const { product, startTime, endTime, currentPrice, startPrice, buyNowPrice, reservePriceMet, myMaxBid } = auction;
    const images = product.images.length > 0 ? product.images.map(img => img.url) : ["https://picsum.photos/200"];
    const timeLeft = calculateTimeLeft(endTime);


    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mx-auto flex justify-center">
                <div className="grid w-full max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)]">
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
                                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border ${selectedImageIndex === index
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
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl font-bold leading-snug">
                                    {product.name}
                                </CardTitle>
                                <Separator />
                                <CardDescription className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        Time left: <span className="font-bold">{timeLeft}</span>
                                    </span>
                                    <span className="mx-1">|</span>
                                    <span>
                                        Bids: <span className="font-bold">{bidCount}</span>
                                    </span>
                                </CardDescription>
                                <Separator />
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between pb-3">
                                        <span className="text-xl font-bold">Current Price:</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(currentPrice)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Start Price:</span>
                                        <span>{formatCurrency(startPrice)}</span>
                                    </div>
                                    <div className={`flex items-center justify-between ${reservePriceMet ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        <span>Reserve Price:</span>
                                        <span>{reservePriceMet ? 'Met' : 'Not Met'}</span>
                                    </div>
                                </div>

                                <Separator />

                                {buyNowPrice && (
                                    <>
                                        <div className="space-y-1 text-center">
                                            <span className="text-lg font-semibold">Buy Now for {formatCurrency(buyNowPrice)}</span>
                                            <Button className="w-full mt-2" variant="outline">Buy Now</Button>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="whitespace-nowrap text-xl font-semibold">
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
                                            className="w-40"
                                        />
                                    </div>
                                    {myMaxBid !== null && myMaxBid !== undefined && (
                                        <p className="text-right text-xs text-muted-foreground">
                                            Your current max bid: {formatCurrency(myMaxBid)}
                                        </p>
                                    )}

                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button
                                    className="h-12 w-full bg-fuchsia-800 text-xl font-bold text-white hover:bg-fuchsia-700"
                                    size="lg"
                                    onClick={handlePlaceBid}
                                    disabled={isPlacingBid}
                                >
                                    {isPlacingBid ? 'Placing Bid...' : 'Place My Bid'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                            <button type="button" className="inline-flex items-center gap-1 hover:text-brand">
                                <MessageCircle className="h-4 w-4" />
                                <span>Contact Seller</span>
                            </button>
                            <button type="button" className="inline-flex items-center gap-1 hover:text-brand">
                                <Printer className="h-4 w-4" />
                                <span>Print Page</span>
                            </button>
                            <button type="button" className="inline-flex items-center gap-1 hover:text-brand">
                                <Share2 className="h-4 w-4" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="mx-auto mt-8 w-full pt-4 mb-12 border-b">
                <Tabs defaultValue="itemInfo" className="w-full">
                    <TabsList className="flex h-12 items-end justify-center gap-10 rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="itemInfo"
                            className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            Item Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="shipping"
                            className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            Shipping
                        </TabsTrigger>
                        <TabsTrigger
                            value="sellerInfo"
                            className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            Seller Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="bidHistory"
                            className="rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                            Bid History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bidHistory" className="mt-8 max-w-6xl mx-auto">
                        <div className="space-y-4">
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Bidder</TableHead>
                                            <TableHead>Bid Amount</TableHead>
                                            <TableHead>High Bidder</TableHead>
                                            <TableHead>Item Price</TableHead>
                                            <TableHead>Time of bid</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="sm:text-sm">
                                        {bidHistory?.data.map((bid, index) => (
                                            <TableRow
                                                key={bid.id}
                                                className={
                                                    index === 0
                                                        ? "bg-muted/40"
                                                        : index % 2 === 0
                                                            ? "bg-muted/20"
                                                            : "bg-background"
                                                }
                                            >
                                                <TableCell>{bid.user.username}</TableCell>
                                                <TableCell>{formatCurrency(bid.displayedAmount)}</TableCell>
                                                <TableCell>{auction?.highestBidder?.id === bid.user.id ? bid.user.username : '---'}</TableCell>
                                                <TableCell>{formatCurrency(bid.displayedAmount)}</TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const bidDate = parseBidTime(bid.bidTime as unknown);
                                                        return bidDate ? format(bidDate, 'dd/MM/yyyy HH:mm:ss') : '---';
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="itemInfo" className="mt-8 max-w-6xl mx-auto">
                        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                            <div>
                                <div className="space-y-2.5 text-base bg-muted p-7 rounded-lg">
                                    <div className="grid grid-cols-[150px_1fr] gap-4">
                                        <span className="font-semibold text-foreground">Item ID:</span>
                                        <span className="text-muted-foreground">{product.id}</span>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4">
                                        <span className="font-semibold text-foreground">Number of Bids:</span>
                                        <span className="text-muted-foreground">{bidCount} (High Bidder: {auction.highestBidder?.username || 'N/A'})</span>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4">
                                        <span className="font-semibold text-foreground">Start time:</span>
                                        <span className="text-muted-foreground">{format(new Date(startTime), 'dd/MM/yyyy HH:mm:ss')}</span>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4">
                                        <span className="font-semibold text-foreground">Ends On:</span>
                                        <span className="text-muted-foreground">{format(new Date(endTime), 'dd/MM/yyyy HH:mm:ss')}</span>
                                    </div>
                                    <div className="grid grid-cols-[150px_1fr] gap-4">
                                        <span className="font-semibold text-foreground">Seller:</span>
                                        <span className="text-blue-600">{product.seller.username}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Item Description</h3>
                                    <p className="text-lg text-muted-foreground">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">DISCLAIMER</h3>
                                    <p className="text-lg text-muted-foreground">
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
                    <TabsContent value="shipping" className="mt-4">
                        <p className="text-muted-foreground">Shipping details will be added here.</p>
                    </TabsContent>
                    <TabsContent value="sellerInfo" className="mt-4">
                        <p className="text-muted-foreground">
                            Seller information will be added here.
                        </p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
