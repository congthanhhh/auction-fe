import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Eye, Pencil, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminConfirmDialog } from "@/components/admin/shared/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminNotice } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import { ProductStatus, type ProductResponse, type ProductStatus as ProductStatusType } from "@/types/auction";
import type { CategoryResponse, ProductUpdateRequest } from "@/types/admin";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const PRODUCT_STATUS_OPTIONS = Object.values(ProductStatus);

interface ProductFormState {
    name: string;
    description: string;
    startPrice: string;
    categoryId: string;
    attributes: string;
}

interface ProductVerifyAction {
    product: ProductResponse;
    isApproved: boolean;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminProducts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [verifyAction, setVerifyAction] = useState<ProductVerifyAction | null>(null);
    const [productForm, setProductForm] = useState<ProductFormState>({
        name: "",
        description: "",
        startPrice: "",
        categoryId: "",
        attributes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [tab, setTab] = useState<"pending" | "all">(searchParams.get("tab") === "all" ? "all" : "pending");
    const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
    const [status, setStatus] = useState<ProductStatusType | "ALL">((searchParams.get("status") as ProductStatusType | null) ?? "ALL");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? "1") || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const next = new URLSearchParams();
        if (tab !== "pending") next.set("tab", tab);
        if (page > 1) next.set("page", String(page));
        if (keyword.trim()) next.set("keyword", keyword.trim());
        if (status !== "ALL") next.set("status", status);
        setSearchParams(next, { replace: true });
    }, [keyword, page, setSearchParams, status, tab]);

    const loadProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response =
                tab === "pending"
                    ? await adminService.getPendingProducts({ page, size: PAGE_SIZE })
                    : await adminService.searchProducts({
                          page,
                          size: PAGE_SIZE,
                          keyword: keyword.trim() || undefined,
                          status: status === "ALL" ? undefined : status,
                      });
            setProducts(response.data ?? []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (err) {
            setError(getErrorMessage(err, "Product admin endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, [keyword, page, status, tab]);

    useEffect(() => {
        void loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await adminService.getCategories({ page: 1, size: 200 });
                setCategories(response.data ?? []);
            } catch {
                setCategories([]);
            }
        };

        void loadCategories();
    }, []);

    const handleTabChange = (value: string) => {
        setTab(value === "all" ? "all" : "pending");
        setPage(1);
    };

    const openEditDialog = (product: ProductResponse) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description ?? "",
            startPrice: String(product.startPrice ?? ""),
            categoryId: product.category?.id ? String(product.category.id) : "",
            attributes: product.attributes ?? "",
        });
    };

    const submitProductForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingProduct) return;

        const payload: ProductUpdateRequest = {
            name: productForm.name.trim(),
            description: productForm.description.trim(),
            startPrice: Number(productForm.startPrice),
            categoryId: productForm.categoryId ? Number(productForm.categoryId) : undefined,
            attributes: productForm.attributes.trim(),
        };

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            await adminService.updateProduct(editingProduct.id, payload);
            setEditingProduct(null);
            setSuccess(`${productForm.name || editingProduct.name} was updated.`);
            await loadProducts();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update product."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyProduct = async (action: ProductVerifyAction) => {
        try {
            setIsVerifying(true);
            setError(null);
            setSuccess(null);
            await adminService.verifyProduct(action.product.id, action.isApproved);
            setVerifyAction(null);
            setSuccess(`${action.product.name} was ${action.isApproved ? "approved" : "rejected"}.`);
            await loadProducts();
        } catch (err) {
            setError(getErrorMessage(err, `Could not ${action.isApproved ? "approve" : "reject"} product.`));
        } finally {
            setIsVerifying(false);
        }
    };

    const content = () => {
        if (isLoading) return <AdminLoadingState title="Loading products..." />;
        if (error && products.length === 0) return <AdminErrorState description={error} onRetry={loadProducts} />;
        if (products.length === 0) return <AdminEmptyState title="No products found" />;

        return (
            <div className="overflow-hidden rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Seller</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="max-w-xs truncate text-xs text-muted-foreground">{product.description}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{product.seller?.username ?? "N/A"}</TableCell>
                                <TableCell>{product.category?.name ?? "N/A"}</TableCell>
                                <TableCell>{formatAdminMoney(product.startPrice)}</TableCell>
                                <TableCell>
                                    <AdminStatusBadge value={product.status} />
                                </TableCell>
                                <TableCell>{formatAdminDate(product.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedProduct(product)}>
                                            <Eye className="size-4" />
                                        </Button>
                                        {product.status === ProductStatus.WAITING_FOR_APPROVAL && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-emerald-700 hover:text-emerald-700"
                                                    onClick={() => setVerifyAction({ product, isApproved: true })}
                                                >
                                                    <Check className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setVerifyAction({ product, isApproved: false })}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(product)}>
                                            <Pencil className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <AdminPagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            </div>
        );
    };

    return (
        <div>
            <AdminPageHeader
                title="Products"
                description="Review pending product submissions and search the catalog for moderation."
                actions={
                    <Button variant="outline" onClick={() => void loadProducts()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            <Tabs value={tab} onValueChange={handleTabChange}>
                <div className="mb-4 flex flex-col gap-3 rounded-md border bg-background p-4 lg:flex-row lg:items-center lg:justify-between">
                    <TabsList>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="all">All products</TabsTrigger>
                    </TabsList>
                    {tab === "all" && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative sm:w-80">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={keyword}
                                    onChange={(event) => {
                                        setKeyword(event.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                    placeholder="Search products"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value as ProductStatusType | "ALL");
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-56">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All statuses</SelectItem>
                                    {PRODUCT_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {error && products.length > 0 && <p className="mb-3 text-sm text-destructive">{error}</p>}
                <AdminNotice tone="success" message={success} />

                <TabsContent value="pending">{content()}</TabsContent>
                <TabsContent value="all">{content()}</TabsContent>
            </Tabs>

            <Sheet open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{selectedProduct?.name}</SheetTitle>
                        <SheetDescription>Product moderation details.</SheetDescription>
                    </SheetHeader>
                    {selectedProduct && (
                        <div className="px-4 pb-6">
                            <AdminDetailRow label="Status">
                                <AdminStatusBadge value={selectedProduct.status} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Active">
                                <AdminStatusBadge value={selectedProduct.isActive} />
                            </AdminDetailRow>
                            <AdminDetailRow label="Seller">{selectedProduct.seller?.username ?? "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Category">{selectedProduct.category?.name ?? "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Start price">
                                {formatAdminMoney(selectedProduct.startPrice)}
                            </AdminDetailRow>
                            <AdminDetailRow label="Description">{selectedProduct.description || "N/A"}</AdminDetailRow>
                            <AdminDetailRow label="Attributes">
                                <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                                    {selectedProduct.attributes || "N/A"}
                                </pre>
                            </AdminDetailRow>
                            <AdminDetailRow label="Created">{formatAdminDate(selectedProduct.createdAt)}</AdminDetailRow>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <form onSubmit={(event) => void submitProductForm(event)} className="space-y-5">
                        <DialogHeader>
                            <DialogTitle>Edit product</DialogTitle>
                            <DialogDescription>
                                Update product metadata using the documented admin product update payload.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="admin-product-name">Name</Label>
                                <Input
                                    id="admin-product-name"
                                    value={productForm.name}
                                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admin-product-price">Start price</Label>
                                <Input
                                    id="admin-product-price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={productForm.startPrice}
                                    onChange={(event) => setProductForm((current) => ({ ...current, startPrice: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={productForm.categoryId}
                                    onValueChange={(value) => setProductForm((current) => ({ ...current, categoryId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="admin-product-description">Description</Label>
                                <textarea
                                    id="admin-product-description"
                                    value={productForm.description}
                                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="admin-product-attributes">Attributes</Label>
                                <textarea
                                    id="admin-product-attributes"
                                    value={productForm.attributes}
                                    onChange={(event) => setProductForm((current) => ({ ...current, attributes: event.target.value }))}
                                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AdminConfirmDialog
                open={Boolean(verifyAction)}
                title={verifyAction?.isApproved ? "Approve product" : "Reject product"}
                description={
                    verifyAction
                        ? `${verifyAction.product.name} will be ${verifyAction.isApproved ? "approved for auction workflows" : "rejected and kept out of active auction workflows"}.`
                        : ""
                }
                confirmLabel={verifyAction?.isApproved ? "Approve" : "Reject"}
                destructive={verifyAction?.isApproved === false}
                isSubmitting={isVerifying}
                onOpenChange={(open) => !open && setVerifyAction(null)}
                onConfirm={() => verifyAction && void verifyProduct(verifyAction)}
            />
        </div>
    );
}
