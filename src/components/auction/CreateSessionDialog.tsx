import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { productService } from "@/services/productService";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionRequest, ProductResponse } from "@/types/auction";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";

interface CreateSessionDialogProps {
    onCreated?: () => Promise<void> | void;
}

const isWaitingForApproval = (product: ProductResponse) => product.status === "WAITING_FOR_APPROVAL";

const getProductStatusLabel = (status: ProductResponse["status"]) => {
    switch (status) {
        case "ACTIVE":
            return "Đã duyệt";
        case "WAITING_FOR_APPROVAL":
            return "Chờ duyệt";
        case "REJECTED":
            return "Bị từ chối";
        case "BANNED":
            return "Bị khóa";
        default:
            return status;
    }
};

const getProductStatusVariant = (status: ProductResponse["status"]) => {
    switch (status) {
        case "ACTIVE":
            return "default";
        case "WAITING_FOR_APPROVAL":
            return "secondary";
        case "REJECTED":
            return "destructive";
        case "BANNED":
            return "destructive";
        default:
            return "outline";
    }
};

export function CreateSessionDialog({ onCreated }: CreateSessionDialogProps) {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reservePrice, setReservePrice] = useState("");
    const [buyNowPrice, setBuyNowPrice] = useState("");
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [sessionSuccessMessage, setSessionSuccessMessage] = useState<string | null>(null);

    const selectedProduct = products.find((product) => String(product.id) === selectedProductId) ?? null;
    const hasWaitingProducts = products.some(isWaitingForApproval);

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                setIsLoadingProducts(true);
                setProductsError(null);
                const res = await productService.getMyProducts();
                setProducts(res ?? []);
            } catch (err) {
                const message =
                    err && typeof err === "object" && "message" in err
                        ? String((err as Error).message)
                        : "Không thể tải danh sách sản phẩm";
                setProductsError(message);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchMyProducts();
    }, []);

    const handleCreateSession = async () => {
        setSessionError(null);
        setSessionSuccessMessage(null);

        if (!selectedProductId) {
            setSessionError("Vui lòng chọn sản phẩm cho phiên đấu giá");
            return;
        }

        if (!startTime || !endTime) {
            setSessionError("Vui lòng chọn thời gian bắt đầu và kết thúc");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            setSessionError("Định dạng thời gian không hợp lệ");
            return;
        }

        if (end <= start) {
            setSessionError("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }

        const reservePriceValue = Number(reservePrice);
        if (!Number.isFinite(reservePriceValue) || reservePriceValue <= 0) {
            setSessionError("Giá chấp nhận bán phải lớn hơn 0");
            return;
        }

        let buyNowPriceValue: number | null | undefined;
        if (buyNowPrice.trim().length > 0) {
            const parsed = Number(buyNowPrice);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                setSessionError("Giá mua ngay phải lớn hơn 0 (hoặc để trống)");
                return;
            }
            buyNowPriceValue = parsed;
        } else {
            buyNowPriceValue = null;
        }

        const payload: AuctionSessionRequest = {
            productId: Number(selectedProductId),
            startTime,
            endTime,
            reservePrice: reservePriceValue,
            buyNowPrice: buyNowPriceValue,
        };

        try {
            setIsCreatingSession(true);
            await auctionService.createSession(payload);
            setSessionSuccessMessage("Tạo phiên đấu giá thành công.");
            await onCreated?.();

            // Reset form values
            setSelectedProductId("");
            setStartTime("");
            setEndTime("");
            setReservePrice("");
            setBuyNowPrice("");
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as Error).message)
                    : "Không thể tạo phiên đấu giá";
            setSessionError(message);
        } finally {
            setIsCreatingSession(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="mt-4 sm:mt-0">
                    <Plus className="size-4" />
                    Tạo phiên mới
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo phiên đấu giá mới</DialogTitle>
                    <DialogDescription>
                        Chọn sản phẩm đã được duyệt và thiết lập thời gian, giá chấp nhận bán, giá mua ngay.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Sản phẩm</Label>
                        <div className="rounded-2xl border bg-background/80 p-3 shadow-sm">
                            {isLoadingProducts ? (
                                <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                    Đang tải sản phẩm...
                                </div>
                            ) : (
                                <ScrollArea className="h-85 pr-3">
                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                                        {products.map((product) => {
                                            const waiting = isWaitingForApproval(product);
                                            const isSelected = String(product.id) === selectedProductId;

                                            return (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!waiting) {
                                                            setSelectedProductId(String(product.id));
                                                        }
                                                    }}
                                                    disabled={waiting}
                                                    className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all ${isSelected
                                                        ? "border-brand ring-2 ring-brand/20 shadow-md"
                                                        : "border-border hover:border-brand/50 hover:shadow-sm"
                                                        } ${waiting ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                                                            {product.images?.[0] ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1 space-y-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className="truncate text-sm font-semibold leading-5 text-foreground">
                                                                    {product.name}
                                                                </p>
                                                                <Badge
                                                                    variant={getProductStatusVariant(product.status)}
                                                                    className="shrink-0 text-[10px]"
                                                                >
                                                                    {getProductStatusLabel(product.status)}
                                                                </Badge>
                                                            </div>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {product.category?.name || "N/A"} • {formatCurrency(product.startPrice)}
                                                            </p>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                Người bán: {product.seller?.username || "N/A"}
                                                            </p>

                                                            <p className="truncate text-xs text-muted-foreground">
                                                                Tạo lúc: {product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <span className="absolute right-3 top-3 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                                                            Đang chọn
                                                        </span>
                                                    )}

                                                    {waiting && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
                                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                                                                Chờ duyệt
                                                            </span>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                        {productsError && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                                {productsError}
                            </p>
                        )}
                        {!isLoadingProducts && !productsError && products.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm trước khi tạo phiên.
                            </p>
                        )}
                        {!isLoadingProducts && !productsError && hasWaitingProducts && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Những sản phẩm đang ở trạng thái chờ duyệt sẽ bị khóa và không thể chọn.
                            </p>
                        )}
                        {selectedProduct && (
                            <div className="rounded-2xl border bg-muted/30 p-4 shadow-sm">
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                                        {selectedProduct.images?.[0] ? (
                                            <img
                                                src={selectedProduct.images[0].url}
                                                alt={selectedProduct.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-base font-semibold">
                                                {selectedProduct.name}
                                            </p>
                                            <Badge variant={getProductStatusVariant(selectedProduct.status)} className="text-[10px]">
                                                {getProductStatusLabel(selectedProduct.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {selectedProduct.description || "No description provided."}
                                        </p>
                                        <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
                                            <span>Danh mục: {selectedProduct.category?.name || "N/A"}</span>
                                            <span>Giá khởi điểm: {formatCurrency(selectedProduct.startPrice)}</span>
                                            <span>Người bán: {selectedProduct.seller?.username || "N/A"}</span>
                                            <span>Tạo lúc: {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString("vi-VN") : "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-startTime">Thời gian bắt đầu</Label>
                            <Input
                                id="create-startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-endTime">Thời gian kết thúc</Label>
                            <Input
                                id="create-endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-reservePrice">Giá chấp nhận bán</Label>
                            <Input
                                id="create-reservePrice"
                                type="number"
                                value={reservePrice}
                                onChange={(e) => setReservePrice(e.target.value)}
                                placeholder="Nhập giá chấp nhận bán"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-buyNowPrice">Giá mua ngay</Label>
                            <Input
                                id="create-buyNowPrice"
                                type="number"
                                value={buyNowPrice}
                                onChange={(e) => setBuyNowPrice(e.target.value)}
                                placeholder="Nhập giá mua ngay (tuỳ chọn)"
                            />
                        </div>
                    </div>
                    {sessionError && (
                        <p className="text-xs text-red-600 dark:text-red-400">{sessionError}</p>
                    )}
                    {sessionSuccessMessage && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {sessionSuccessMessage}
                        </p>
                    )}
                </div>
                <DialogFooter showCloseButton>
                    <Button
                        type="button"
                        onClick={handleCreateSession}
                        disabled={isCreatingSession}
                    >
                        {isCreatingSession ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                        {isCreatingSession ? "Đang tạo..." : "Tạo phiên"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
