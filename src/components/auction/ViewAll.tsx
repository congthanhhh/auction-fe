import { useState, useEffect } from "react"
import ViewAllCard from "@/components/auction/ViewAllCard"
import { auctionService } from "@/services/auctionService"
import type { AuctionSessionResponse, PageResponse } from "@/types/auction"
import { calculateTimeRemaining } from "@/lib/utils"

interface AuctionItem {
    id: number
    title: string
    image: string
    currentBid: number
    bids: number
    timeRemaining: string
    isBuyNow?: boolean
    buyNowPrice?: number
}

export default function ViewAll() {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [totalItems, setTotalItems] = useState(0)
    const [items, setItems] = useState<AuctionItem[]>([])
    const [sortBy, setSortBy] = useState("ending-soon")
    const [filters, setFilters] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                setLoading(true)
                setError(null)

                const pageResponse: PageResponse<AuctionSessionResponse> =
                    await auctionService.getActiveAuctionSessionsDesc(currentPage, itemsPerPage)

                setTotalItems(pageResponse.totalElements)
                setItemsPerPage(pageResponse.pageSize)

                const mappedItems: AuctionItem[] = pageResponse.data.map((auction) => {
                    const hasBids = auction.currentPrice > auction.startPrice || auction.highestBidder !== null
                    const bidCount = hasBids ? 1 : 0 // TODO: update when backend provides bid count

                    return {
                        id: auction.id,
                        title: auction.product.name,
                        image:
                            auction.product.images[0]?.url || "https://picsum.photos/200",
                        currentBid: auction.currentPrice,
                        bids: bidCount,
                        timeRemaining: calculateTimeRemaining(auction.endTime),
                        isBuyNow: !!auction.buyNowPrice && !hasBids,
                        buyNowPrice: auction.buyNowPrice ?? undefined,
                    }
                })

                setItems(mappedItems)
            } catch (err) {
                console.error("Failed to fetch auctions for View All:", err)
                setError("Failed to load auction items. Please try again later.")
                setItems([])
            } finally {
                setLoading(false)
            }
        }

        // Note: sortBy, filters hiện tại chưa được backend hỗ trợ,
        // nên chỉ được dùng để trigger refetch khi UI thay đổi.
        fetchAuctions()
    }, [currentPage, itemsPerPage, sortBy, filters])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setCurrentPage(1)
    }

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">Loading auction items...</p>
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
            title="Featured Items"
            items={items}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
        />
    )
}
