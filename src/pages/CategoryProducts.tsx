import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ViewAllCard, { type AuctionListItem, type ProductFilterState } from "@/components/auction/ViewAllCard";
import { categoryService } from "@/services/categoryService";
import { auctionService } from "@/services/auctionService";
import type { AuctionSessionResponse, CategoryResponse } from "@/types/auction";
import { calculateTimeRemaining } from "@/lib/utils";

const itemsPerPage = 12;

function mapSessionToAuctionItem(session: AuctionSessionResponse): AuctionListItem {
    const hasBids = session.currentPrice > session.startPrice || session.highestBidder !== null;

    return {
        id: session.id,
        productId: session.product.id,
        title: session.product.name,
        image: session.product.images[0]?.url || "https://placehold.co/400x400?text=No+Image",
        currentBid: session.currentPrice,
        bids: hasBids ? 1 : 0,
        timeRemaining: calculateTimeRemaining(session.endTime),
        isBuyNow: Boolean(session.buyNowPrice) && !hasBids,
        buyNowPrice: session.buyNowPrice ?? undefined,
    };
}

export default function CategoryProducts() {
    const { t } = useTranslation();
    const { id } = useParams();
    const categoryId = Number(id);

    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [sessions, setSessions] = useState<AuctionSessionResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filters, setFilters] = useState<ProductFilterState>({ categoryId });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategorySessions = async () => {
            if (!Number.isFinite(categoryId)) {
                setError(t("auction.categories.invalidId"));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [categoryResponse, activeResponse] = await Promise.all([
                    categoryService.getCategoryById(categoryId),
                    auctionService.getActiveAuctionSessionsDesc(1, 1000),
                ]);

                setCategory(categoryResponse);
                setSessions(
                    activeResponse.data.filter(
                        (session) =>
                            session.product.status === "ACTIVE" &&
                            session.product.category?.id === categoryId,
                    ),
                );
            } catch (err) {
                console.error("Failed to fetch auction sessions by category:", err);
                setCategory(null);
                setSessions([]);
                setError(
                    err && typeof err === "object" && "message" in err
                        ? String((err as Error).message)
                        : t("auction.categories.loadSessionsError"),
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCategorySessions();
    }, [categoryId, t]);

    const filteredAndSortedSessions = useMemo(() => {
        const keyword = filters.keyword?.trim().toLowerCase();
        let nextSessions = [...sessions];

        if (keyword) {
            nextSessions = nextSessions.filter((session) =>
                [session.product.name, session.product.description, session.product.category?.name]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(keyword)),
            );
        }

        if (typeof filters.priceMin === "number") {
            nextSessions = nextSessions.filter((session) => session.product.startPrice >= filters.priceMin!);
        }

        if (typeof filters.priceMax === "number") {
            nextSessions = nextSessions.filter((session) => session.product.startPrice <= filters.priceMax!);
        }

        switch (sortBy) {
            case "price_asc":
                nextSessions.sort((a, b) => a.product.startPrice - b.product.startPrice);
                break;
            case "price_desc":
                nextSessions.sort((a, b) => b.product.startPrice - a.product.startPrice);
                break;
            case "oldest":
                nextSessions.sort(
                    (a, b) => new Date(a.product.createdAt).getTime() - new Date(b.product.createdAt).getTime(),
                );
                break;
            case "newest":
            default:
                nextSessions.sort(
                    (a, b) => new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime(),
                );
                break;
        }

        return nextSessions;
    }, [sessions, filters, sortBy]);

    const pagedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedSessions.slice(startIndex, startIndex + itemsPerPage).map(mapSessionToAuctionItem);
    }, [filteredAndSortedSessions, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSortChange = (sort: string) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    const handleFilterChange = (newFilters: ProductFilterState) => {
        setFilters({ ...newFilters, categoryId });
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
                {t("auction.categories.loadingSessions")}
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
                {t("auction.categories.notFound")}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 pt-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-brand2 dark:text-white">
                            {category.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {category.description || t("auction.categories.browseActive")}
                        </p>
                    </div>
                    <Link to="/categories" className="text-sm font-medium text-brand hover:underline">
                        {t("auction.categories.backCategories")}
                    </Link>
                </div>
            </div>

            <ViewAllCard
                title={t("auction.categories.categoryAuctions", { name: category.name })}
                items={pagedItems}
                totalItems={filteredAndSortedSessions.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                categories={[category]}
                selectedCategoryId={categoryId}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
}
