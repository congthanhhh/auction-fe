import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { imageService } from "@/services/imageService";
import type { CategoryResponse, ProductRequest, Image } from "@/types/auction";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateProductDialogProps {
    onCreated?: () => void;
}

export function CreateProductDialog({ onCreated }: CreateProductDialogProps) {
    const [categoriesForProduct, setCategoriesForProduct] = useState<CategoryResponse[]>([]);
    const [productName, setProductName] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productStartPrice, setProductStartPrice] = useState("");
    const [productCategoryId, setProductCategoryId] = useState<string>("");
    const [attributeRows, setAttributeRows] = useState<{ name: string; value: string }[]>([
        { name: "", value: "" },
    ]);
    const [images, setImages] = useState<Image[]>([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [productError, setProductError] = useState<string | null>(null);
    const [productSuccessMessage, setProductSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoriesForProduct = async () => {
            try {
                const res = await categoryService.getCategories(1, 100);
                setCategoriesForProduct(res.data ?? []);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch categories for product form:", err);
            }
        };

        fetchCategoriesForProduct();
    }, []);

    const handleCreateProduct = async () => {
        setProductError(null);
        setProductSuccessMessage(null);

        if (!productName.trim()) {
            setProductError("Tên sản phẩm không được để trống");
            return;
        }

        const startPriceValue = Number(productStartPrice);
        if (!Number.isFinite(startPriceValue) || startPriceValue <= 0) {
            setProductError("Giá khởi điểm phải lớn hơn 0");
            return;
        }

        const categoryIdValue = Number(productCategoryId);
        if (!categoryIdValue) {
            setProductError("Vui lòng chọn danh mục");
            return;
        }

        const attributesObject: Record<string, string> = {};
        for (const row of attributeRows) {
            const key = row.name.trim();
            const val = row.value.trim();
            if (key && val) {
                attributesObject[key] = val;
            }
        }

        const attributesString =
            Object.keys(attributesObject).length > 0
                ? JSON.stringify(attributesObject)
                : undefined;

        const imageIdsArray = images.map((img) => img.id);

        try {
            setIsCreatingProduct(true);
            const payload: ProductRequest = {
                name: productName.trim(),
                description: productDescription.trim() || undefined,
                startPrice: startPriceValue,
                categoryId: categoryIdValue,
                imageIds: imageIdsArray,
                ...(attributesString ? { attributes: attributesString } : {}),
            };

            const created = await productService.createProduct(payload);
            setProductSuccessMessage(`Tạo sản phẩm #${created.id} thành công.`);

            // Optional: reset form state after successful creation
            setProductName("");
            setProductDescription("");
            setProductStartPrice("");
            setProductCategoryId("");
            setAttributeRows([{ name: "", value: "" }]);
            setImages([]);

            if (onCreated) {
                onCreated();
            }
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as any).message)
                    : "Không thể tạo sản phẩm";
            setProductError(message);
        } finally {
            setIsCreatingProduct(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
                    Tạo sản phẩm mới
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tạo sản phẩm mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin sản phẩm để sử dụng cho các phiên đấu giá.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="product-name">Tên sản phẩm</Label>
                        <Input
                            id="product-name"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Nhập tên sản phẩm"
                        />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Danh mục</Label>
                            <Select
                                value={productCategoryId}
                                onValueChange={(value) => setProductCategoryId(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoriesForProduct.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="product-startPrice">Giá khởi điểm</Label>
                            <Input
                                id="product-startPrice"
                                type="number"
                                min={0}
                                value={productStartPrice}
                                onChange={(e) => setProductStartPrice(e.target.value)}
                                placeholder="Nhập giá khởi điểm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="product-description">Mô tả</Label>
                        <textarea
                            id="product-description"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Mô tả chi tiết về sản phẩm (tuỳ chọn)"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Thuộc tính (tuỳ chọn)</Label>
                        <div className="space-y-2">
                            {attributeRows.map((row, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Tên thuộc tính (ví dụ: Màu)"
                                        value={row.name}
                                        onChange={(e) => {
                                            const next = [...attributeRows];
                                            next[index] = { ...next[index], name: e.target.value };
                                            setAttributeRows(next);
                                        }}
                                    />
                                    <Input
                                        placeholder="Giá trị (ví dụ: Đỏ)"
                                        value={row.value}
                                        onChange={(e) => {
                                            const next = [...attributeRows];
                                            next[index] = { ...next[index], value: e.target.value };
                                            setAttributeRows(next);
                                        }}
                                    />
                                    {attributeRows.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => {
                                                setAttributeRows((prev) =>
                                                    prev.filter((_, i) => i !== index),
                                                );
                                            }}
                                        >
                                            -
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setAttributeRows((prev) => [...prev, { name: "", value: "" }])
                                }
                            >
                                + Thêm thuộc tính
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="product-images">Hình ảnh sản phẩm (tuỳ chọn)</Label>
                        <Input
                            id="product-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                setProductError(null);
                                setIsUploadingImage(true);

                                const uploaded: Image[] = [];
                                try {
                                    for (let i = 0; i < files.length; i += 1) {
                                        const file = files[i];
                                        const img = await imageService.uploadImage(file);
                                        uploaded.push(img);
                                    }
                                    setImages((prev) => [...prev, ...uploaded]);
                                } catch (err) {
                                    const message =
                                        err && typeof err === "object" && "message" in err
                                            ? String((err as any).message)
                                            : "Không thể upload hình ảnh";
                                    setProductError(message);
                                } finally {
                                    setIsUploadingImage(false);
                                    // Clear input value so selecting the same file again still triggers change
                                    e.target.value = "";
                                }
                            }}
                        />

                        {isUploadingImage && (
                            <p className="text-[11px] text-muted-foreground">Đang upload ảnh...</p>
                        )}
                        {images.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-3">
                                {images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative h-20 w-20 overflow-hidden rounded-md border"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.publicId}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
                                            onClick={async () => {
                                                try {
                                                    await imageService.deleteImage(img.id);
                                                } catch (err) {
                                                    // eslint-disable-next-line no-console
                                                    console.error("Failed to delete image", err);
                                                } finally {
                                                    setImages((prev) =>
                                                        prev.filter((item) => item.id !== img.id),
                                                    );
                                                }
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {productError && (
                        <p className="text-xs text-red-600 dark:text-red-400">{productError}</p>
                    )}
                    {productSuccessMessage && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            {productSuccessMessage}
                        </p>
                    )}
                </div>
                <DialogFooter showCloseButton>
                    <Button type="button" onClick={handleCreateProduct} disabled={isCreatingProduct}>
                        {isCreatingProduct ? "Đang tạo..." : "Tạo sản phẩm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
