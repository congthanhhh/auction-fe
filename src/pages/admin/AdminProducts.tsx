import { useCallback, useEffect, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDetailRow, AdminStatusBadge } from "@/components/admin/shared/AdminFormat";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import { ProductStatus, type ProductResponse, type ProductStatus as ProductStatusType } from "@/types/auction";
import { formatAdminDate, formatAdminMoney } from "@/utils/admin-format";

const PAGE_SIZE = 10;
const PRODUCT_STATUS_OPTIONS = Object.values(ProductStatus);

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [tab, setTab] = useState<"pending" | "all">("pending");
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState<ProductStatusType | "ALL">("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleTabChange = (value: string) => {
        setTab(value === "all" ? "all" : "pending");
        setPage(1);
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
                                    <Button variant="ghost" size="icon-sm" onClick={() => setSelectedProduct(product)}>
                                        <Eye className="size-4" />
                                    </Button>
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
        </div>
    );
}
