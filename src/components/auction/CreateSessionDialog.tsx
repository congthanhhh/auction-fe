import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { productService } from "@/services/productService";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionRequest, ProductResponse } from "@/types/auction";

export function CreateSessionDialog() {
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
                        ? String((err as any).message)
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

            // Reset form values
            setSelectedProductId("");
            setStartTime("");
            setEndTime("");
            setReservePrice("");
            setBuyNowPrice("");
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as any).message)
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
                    Tạo phiên mới
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo phiên đấu giá mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để tạo một phiên đấu giá mới. Logic lưu sẽ được thêm
                        sau.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Sản phẩm</Label>
                        <Select
                            value={selectedProductId}
                            onValueChange={(value) => setSelectedProductId(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={
                                        isLoadingProducts
                                            ? "Đang tải sản phẩm..."
                                            : "Chọn sản phẩm cho phiên đấu giá"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={String(product.id)}>
                                        <div className="flex items-center gap-2">
                                            {product.images && product.images[0] && (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="h-8 w-8 rounded object-cover"
                                                />
                                            )}
                                            <span className="truncate">{product.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        {isCreatingSession ? "Đang tạo..." : "Tạo phiên"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
