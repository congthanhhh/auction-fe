import { useState, useEffect } from "react"
import ViewAllCard from "@/components/auction/ViewAllCard"

export default function Recommended() {
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy, setSortBy] = useState("ending-soon")
    const [filters, setFilters] = useState({})

    const itemsPerPage = 12
    const totalItems = 48 // Different total from Featured Items

    // Mock data for orders - replace with API call
    const generateOrderItems = (page: number, perPage: number) => {
        return Array.from({ length: Math.min(perPage, totalItems - (page - 1) * perPage) }, (_, i) => ({
            id: i + 1 + (page - 1) * perPage,
            title: `My Order Item ${i + 1 + (page - 1) * perPage} - Vintage Collection`,
            image: `https://via.placeholder.com/300x300?text=Order+${i + 1 + (page - 1) * perPage}`,
            currentBid: Math.random() * 500 + 50,
            bids: Math.floor(Math.random() * 30),
            timeRemaining: `${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`,
            isBuyNow: Math.random() > 0.5,
            buyNowPrice: Math.random() * 1000 + 200,
        }))
    }

    const [items, setItems] = useState(() => generateOrderItems(currentPage, itemsPerPage))

    useEffect(() => {
        // In real app: fetchMyOrders(currentPage, itemsPerPage, sortBy, filters)
        const newItems = generateOrderItems(currentPage, itemsPerPage)
        setItems(newItems)
    }, [currentPage, sortBy, filters, totalItems, itemsPerPage])

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

    return (
        <ViewAllCard
            title="My Orders"
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
