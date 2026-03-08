import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, ChevronRight, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import AuctionCard from "./AuctionCard"

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

interface FilterState {
    keyword?: string
    priceMin?: number
    priceMax?: number
    locations?: string[]
    shippingOptions?: string[]
    listingTypes?: string[]
}

interface ViewAllCardProps {
    title?: string
    items: AuctionItem[]
    totalItems: number
    itemsPerPage: number
    currentPage: number
    onPageChange: (page: number) => void
    onFilterChange?: (filters: FilterState) => void
    onSortChange?: (sortBy: string) => void
}

export default function ViewAllCard({
    title = "All Items",
    items,
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onFilterChange,
    onSortChange,
}: ViewAllCardProps) {
    const [priceOpen, setPriceOpen] = useState(false)
    const [locationOpen, setLocationOpen] = useState(false)
    const [shippingOpen, setShippingOpen] = useState(false)
    const [listingTypeOpen, setListingTypeOpen] = useState(false)

    // Filter state
    const [keyword, setKeyword] = useState("")
    const [priceMin, setPriceMin] = useState("")
    const [priceMax, setPriceMax] = useState("")

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const handlePageChange = (page: number) => {
        onPageChange(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleApplyPriceFilter = () => {
        if (onFilterChange) {
            onFilterChange({
                keyword,
                priceMin: priceMin ? parseFloat(priceMin) : undefined,
                priceMax: priceMax ? parseFloat(priceMax) : undefined,
            })
        }
    }

    const handleClearFilters = () => {
        setKeyword("")
        setPriceMin("")
        setPriceMax("")
        if (onFilterChange) {
            onFilterChange({})
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Filter */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-brand2 dark:text-brand">Filter Results</h2>
                            <Button variant="ghost" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search Keyword */}
                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Search Keyword"
                                className="w-full"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>

                        <Separator className="my-4" />

                        {/* Categories */}
                        <Link to="/categories" className="flex items-center justify-between py-3 hover:text-brand">
                            <span className="font-semibold text-brand2 dark:text-white">CATEGORIES</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>

                        <Separator className="my-4" />

                        {/* Price Filter */}
                        <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
                            <CollapsibleTrigger className="flex items-center justify-between py-3 w-full hover:text-brand">
                                <span className="font-semibold text-brand2 dark:text-white">PRICE</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 pt-3">
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                    />
                                    <span>-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full bg-brand hover:bg-brand-hover"
                                    size="sm"
                                    onClick={handleApplyPriceFilter}
                                >
                                    Apply
                                </Button>
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-4" />

                        {/* Seller Location */}
                        <Collapsible open={locationOpen} onOpenChange={setLocationOpen}>
                            <CollapsibleTrigger className="flex items-center justify-between py-3 w-full hover:text-brand">
                                <span className="font-semibold text-brand2 dark:text-white">SELLER LOCATION</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="us" />
                                    <Label htmlFor="us" className="cursor-pointer">United States</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="uk" />
                                    <Label htmlFor="uk" className="cursor-pointer">United Kingdom</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="vn" />
                                    <Label htmlFor="vn" className="cursor-pointer">Vietnam</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="other" />
                                    <Label htmlFor="other" className="cursor-pointer">Other Countries</Label>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-4" />

                        {/* Shipping Options */}
                        <Collapsible open={shippingOpen} onOpenChange={setShippingOpen}>
                            <CollapsibleTrigger className="flex items-center justify-between py-3 w-full hover:text-brand">
                                <span className="font-semibold text-brand2 dark:text-white">SHIPPING OPTIONS</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${shippingOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="free-shipping" />
                                    <Label htmlFor="free-shipping" className="cursor-pointer">Free Shipping</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="one-cent" />
                                    <Label htmlFor="one-cent" className="cursor-pointer">1¢ Shipping</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="local-pickup" />
                                    <Label htmlFor="local-pickup" className="cursor-pointer">Local Pickup</Label>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-4" />

                        {/* Listing Type */}
                        <Collapsible open={listingTypeOpen} onOpenChange={setListingTypeOpen}>
                            <CollapsibleTrigger className="flex items-center justify-between py-3 w-full hover:text-brand">
                                <span className="font-semibold text-brand2 dark:text-white">LISTING TYPE</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${listingTypeOpen ? 'rotate-180' : ''}`} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-2 pt-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="auction" />
                                    <Label htmlFor="auction" className="cursor-pointer">Auction</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="buy-now" />
                                    <Label htmlFor="buy-now" className="cursor-pointer">Buy It Now</Label>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Separator className="my-4" />

                        {/* Clear Filters */}
                        <Button variant="outline" className="w-full" onClick={handleClearFilters}>
                            Clear All Filters
                        </Button>
                    </div>
                </div>

                {/* Right Content - Cards Grid */}
                <div className="lg:col-span-3">
                    {/* Header with title */}
                    {title && (
                        <h1 className="text-3xl font-bold text-brand2 dark:text-brand mb-6">{title}</h1>
                    )}

                    {/* Sort and View Options */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Sort by:</span>
                            <Select
                                defaultValue="ending-soon"
                                onValueChange={onSortChange}
                            >
                                <SelectTrigger className="w-45">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                                    <SelectItem value="newly-listed">Newly Listed</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="most-bids">Most Bids</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <AuctionCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    image={item.image}
                                    currentBid={item.currentBid}
                                    bids={item.bids}
                                    timeRemaining={item.timeRemaining}
                                    isBuyNow={item.isBuyNow}
                                    buyNowPrice={item.buyNowPrice}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No items found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (currentPage > 1) handlePageChange(currentPage - 1)
                                        }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {/* First Page */}
                                {currentPage > 3 && (
                                    <>
                                        <PaginationItem>
                                            <PaginationLink
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePageChange(1)
                                                }}
                                                className="cursor-pointer"
                                            >
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    </>
                                )}

                                {/* Page Numbers Around Current */}
                                {[...Array(5)].map((_, i) => {
                                    const pageNum = currentPage - 2 + i
                                    if (pageNum < 1 || pageNum > totalPages) return null

                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePageChange(pageNum)
                                                }}
                                                isActive={currentPage === pageNum}
                                                className={currentPage === pageNum
                                                    ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer'
                                                    : 'cursor-pointer'}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                })}

                                {/* Last Page */}
                                {currentPage < totalPages - 2 && (
                                    <>
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePageChange(totalPages)
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                    </>
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                        }}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    )
}
