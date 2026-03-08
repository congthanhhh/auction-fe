import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, ChevronRight, ChevronDown, ChevronLeft } from "lucide-react"
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
import AuctionCard from "./AuctionCard"

export default function ViewAllCard() {
    const [currentPage, setCurrentPage] = useState(1)
    const [priceOpen, setPriceOpen] = useState(false)
    const [locationOpen, setLocationOpen] = useState(false)
    const [shippingOpen, setShippingOpen] = useState(false)
    const [listingTypeOpen, setListingTypeOpen] = useState(false)

    const totalPages = 10
    const itemsPerPage = 12

    // Mock data - replace with real data later
    const mockItems = Array.from({ length: itemsPerPage }, (_, i) => ({
        id: i + 1 + (currentPage - 1) * itemsPerPage,
        title: `Auction Item ${i + 1 + (currentPage - 1) * itemsPerPage}`,
        image: `https://via.placeholder.com/300x300?text=Item+${i + 1}`,
        currentBid: Math.random() * 1000 + 100,
        bids: Math.floor(Math.random() * 50),
        timeRemaining: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    }))

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
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
                                    <Input type="number" placeholder="Min" className="w-full" />
                                    <span>-</span>
                                    <Input type="number" placeholder="Max" className="w-full" />
                                </div>
                                <Button className="w-full bg-brand hover:bg-brand-hover" size="sm">
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
                        <Button variant="outline" className="w-full">
                            Clear All Filters
                        </Button>
                    </div>
                </div>

                {/* Right Content - Cards Grid */}
                <div className="lg:col-span-3">
                    {/* Sort and View Options */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)} of {totalPages * itemsPerPage} results
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Sort by:</span>
                            <Select defaultValue="ending-soon">
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
                        {mockItems.map((item) => (
                            <AuctionCard
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                image={item.image}
                                currentBid={item.currentBid}
                                bids={item.bids}
                                timeRemaining={item.timeRemaining}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber: number
                            if (totalPages <= 5) {
                                pageNumber = i + 1
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i
                            } else {
                                pageNumber = currentPage - 2 + i
                            }

                            return (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    className={currentPage === pageNumber ? "bg-brand hover:bg-brand-hover" : ""}
                                    onClick={() => handlePageChange(pageNumber)}
                                >
                                    {pageNumber}
                                </Button>
                            )
                        })}

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
