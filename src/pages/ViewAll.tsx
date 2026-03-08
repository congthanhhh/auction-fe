import { useState, useEffect } from "react"
import ViewAllCard from "@/components/auction/ViewAllCard"

export default function ViewAll() {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState("ending-soon")
    const [filters, setFilters] = useState({})

    const itemsPerPage = 12
    const totalItems = 120 // This would come from API response

    // Mock data generator - replace with API call
    const generateMockItems = (page: number, perPage: number) => {
        return Array.from({ length: perPage }, (_, i) => ({
            id: i + 1 + (page - 1) * perPage,
            title: `Featured Auction Item ${i + 1 + (page - 1) * perPage}`,
            image: `https://via.placeholder.com/300x300?text=Item+${i + 1 + (page - 1) * perPage}`,
            currentBid: Math.random() * 1000 + 100,
            bids: Math.floor(Math.random() * 50),
            timeRemaining: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
            isBuyNow: Math.random() > 0.7,
            buyNowPrice: Math.random() * 2000 + 500,
        }))
    }

    const [items, setItems] = useState(() => generateMockItems(currentPage, itemsPerPage))

    // Simulate data fetching when page, sort, or filters change
    useEffect(() => {
        // In real app, this would be an API call
        // fetchItems(currentPage, itemsPerPage, sortBy, filters)
        const newItems = generateMockItems(currentPage, itemsPerPage)
        setItems(newItems)
    }, [currentPage, sortBy, filters])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSortChange = (sort: string) => {
        setSortBy(sort)
        setCurrentPage(1) // Reset to first page on sort change
    }

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters)
        setCurrentPage(1) // Reset to first page on filter change
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
