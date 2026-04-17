import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ViewAllCard from "@/components/auction/ViewAllCard";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import type { CategoryResponse, ProductResponse } from "@/types/auction";

interface AuctionItem {
    id: number;
    title: string;
    image: string;
    currentBid: number;
    bids: number;
    timeRemaining: string;
    isBuyNow?: boolean;
    buyNowPrice?: number;
}

interface FilterState {
    keyword?: string;
    priceMin?: number;
    priceMax?: number;
}

const itemsPerPage = 12;

function mapProductToAuctionItem(product: ProductResponse): AuctionItem {
    return {
        id: product.id,
        title: product.name,
        image: product.images[0]?.url || "https://placehold.co/400x400?text=No+Image",
        currentBid: product.startPrice,
        bids: 0,
        timeRemaining: product.status,
        isBuyNow: false,
    };
}

export default function CategoryProducts() {
    const { id } = useParams();
    const categoryId = Number(id);

    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("ending-soon");
    const [filters, setFilters] = useState<FilterState>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (!Number.isFinite(categoryId)) {
                setError("Invalid category id");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [categoryResponse, activeResponse] = await Promise.all([
                    categoryService.getCategoryById(categoryId),
                    productService.searchProducts(
                        {
                            categoryId,
                            status: "ACTIVE",
                            isActive: true,
                        },
                        1,
                        1000,
                    ),
                ]);

                setCategory(categoryResponse);

                setProducts(activeResponse.data ?? []);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch products by category:", err);
                setCategory(null);
                setProducts([]);
                setError(
                    err && typeof err === "object" && "message" in err
                        ? String((err as any).message)
                        : "Không thể tải sản phẩm của danh mục này.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [categoryId]);

    const filteredAndSortedProducts = useMemo(() => {
        const keyword = filters.keyword?.trim().toLowerCase();

        let nextProducts = [...products];

        if (keyword) {
            nextProducts = nextProducts.filter((product) =>
                [product.name, product.description, product.category?.name]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(keyword)),
            );
        }

        if (typeof filters.priceMin === "number") {
            nextProducts = nextProducts.filter((product) => product.startPrice >= filters.priceMin!);
        }

        if (typeof filters.priceMax === "number") {
            nextProducts = nextProducts.filter((product) => product.startPrice <= filters.priceMax!);
        }

        switch (sortBy) {
            case "price-low":
                nextProducts.sort((a, b) => a.startPrice - b.startPrice);
                break;
            case "price-high":
                nextProducts.sort((a, b) => b.startPrice - a.startPrice);
                break;
            case "newly-listed":
                nextProducts.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                );
                break;
            case "most-bids":
                nextProducts.sort((a, b) => b.id - a.id);
                break;
            case "ending-soon":
            default:
                nextProducts.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                );
                break;
        }

        return nextProducts;
    }, [products, filters, sortBy]);

    const pagedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage).map(mapProductToAuctionItem);
    }, [filteredAndSortedProducts, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-sm text-red-600 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (!category) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
                Category not found.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 pt-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand2 dark:text-white">
                            {category.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {category.description || "Browse products in this category."}
                        </p>
                    </div>
                    <Link to="/categories" className="text-sm font-medium text-brand hover:underline">
                        ← Back to Categories
                    </Link>
                </div>
            </div>

            <ViewAllCard
                title={`${category.name} Products`}
                items={pagedItems}
                totalItems={filteredAndSortedProducts.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
}
