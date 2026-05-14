import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import ViewAllCard, { type AuctionListItem, type ProductFilterState } from "@/components/auction/ViewAllCard"
import { categoryService } from "@/services/categoryService"
import { productService } from "@/services/productService"
import { auctionService } from "@/services/auctionService"
import type {
    AuctionSessionResponse,
    CategoryResponse,
    PageResponse,
    ProductResponse,
    ProductSearchRequest,
} from "@/types/auction"
import { calculateTimeRemaining } from "@/lib/utils"

const searchBatchSize = 1000

function mapSortToProductSearchSort(sortBy: string): string {
    switch (sortBy) {
        case "oldest":
        case "price_asc":
        case "price_desc":
        case "newest":
            return sortBy
        default:
            return "newest"
    }
}

function mapSessionToAuctionItem(session: AuctionSessionResponse): AuctionListItem {
    const hasBids = session.currentPrice > session.startPrice || session.highestBidder !== null

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
    }
}

export default function Recommended() {
    const { t } = useTranslation()
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [totalItems, setTotalItems] = useState(0)
    const [items, setItems] = useState<AuctionListItem[]>([])
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [sortBy, setSortBy] = useState("newest")
    const [filters, setFilters] = useState<ProductFilterState>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories(1, 100)
                if (isMounted) setCategories(response.data ?? [])
            } catch (err) {
                console.error("Failed to load categories for recommended auctions:", err)
                if (isMounted) setCategories([])
            }
        }

        fetchCategories()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const fetchAuctionItems = async () => {
            try {
                setLoading(true)
                setError(null)

                const searchParams: ProductSearchRequest = {
                    keyword: filters.keyword?.trim() || undefined,
                    categoryId: filters.categoryId,
                    minPrice: filters.priceMin,
                    maxPrice: filters.priceMax,
                    status: "ACTIVE",
                    isActive: true,
                    sort: mapSortToProductSearchSort(sortBy),
                }

                const [productResponse, sessionResponse]: [
                    PageResponse<ProductResponse>,
                    PageResponse<AuctionSessionResponse>,
                ] = await Promise.all([
                    productService.searchProducts(searchParams, 1, searchBatchSize),
                    auctionService.getActiveAuctionSessionsDesc(1, searchBatchSize),
                ])

                if (!isMounted) return

                const productOrder = new Map(
                    productResponse.data.map((product, index) => [product.id, index]),
                )

                const matchedSessions = sessionResponse.data
                    .filter((session) => (
                        session.product.status === "ACTIVE" &&
                        productOrder.has(session.product.id)
                    ))
                    .sort((a, b) => {
                        const aIndex = productOrder.get(a.product.id) ?? Number.MAX_SAFE_INTEGER
                        const bIndex = productOrder.get(b.product.id) ?? Number.MAX_SAFE_INTEGER
                        return aIndex - bIndex
                    })

                const startIndex = (currentPage - 1) * itemsPerPage
                const currentPageSessions = matchedSessions.slice(startIndex, startIndex + itemsPerPage)

                setItems(currentPageSessions.map(mapSessionToAuctionItem))
                setTotalItems(matchedSessions.length)
            } catch (err) {
                if (!isMounted) return
                console.error("Failed to load recommended auctions:", err)
                setError(t("auction.list.loadRecommendedError"))
                setItems([])
                setTotalItems(0)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchAuctionItems()

        return () => {
            isMounted = false
        }
    }, [currentPage, itemsPerPage, sortBy, filters, t])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setCurrentPage(1)
    }

    const handleFilterChange = (newFilters: ProductFilterState) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">{t("auction.list.loadingRecommended")}</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-red-500 dark:text-red-400">{error}</p>
            </div>
        )
    }

    return (
        <ViewAllCard
            title={t("auction.list.recommendedTitle")}
            items={items}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            categories={categories}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
        />
    )
}
