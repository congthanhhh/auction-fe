import { type FormEvent, useState } from "react"
import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination"
import { formatNumber } from "@/lib/utils"
import type { CategoryResponse } from "@/types/auction"
import AuctionCard from "./AuctionCard"

export interface AuctionListItem {
    id: number
    productId: number
    title: string
    image: string
    currentBid: number
    bids: number
    timeRemaining: string
    isBuyNow?: boolean
    buyNowPrice?: number
}

export interface ProductFilterState {
    keyword?: string
    categoryId?: number
    priceMin?: number
    priceMax?: number
}

interface ViewAllCardProps {
    title?: string
    items: AuctionListItem[]
    totalItems: number
    itemsPerPage: number
    currentPage: number
    categories?: CategoryResponse[]
    selectedCategoryId?: number
    onPageChange: (page: number) => void
    onFilterChange?: (filters: ProductFilterState) => void
    onSortChange?: (sortBy: string) => void
}

const allCategoriesValue = "ALL"

export default function ViewAllCard({
    title,
    items,
    totalItems,
    itemsPerPage,
    currentPage,
    categories = [],
    selectedCategoryId,
    onPageChange,
    onFilterChange,
    onSortChange,
}: ViewAllCardProps) {
    const { t } = useTranslation()
    const [keyword, setKeyword] = useState("")
    const [categoryValue, setCategoryValue] = useState(
        selectedCategoryId ? String(selectedCategoryId) : allCategoriesValue,
    )
    const [priceMin, setPriceMin] = useState("")
    const [priceMax, setPriceMax] = useState("")

    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const firstItemIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const lastItemIndex = Math.min(currentPage * itemsPerPage, totalItems)

    const buildFilters = (): ProductFilterState => ({
        keyword: keyword.trim() || undefined,
        categoryId: categoryValue === allCategoriesValue ? undefined : Number(categoryValue),
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
    })

    const handleSubmitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onFilterChange?.(buildFilters())
    }

    const handleClearFilters = () => {
        setKeyword("")
        setCategoryValue(selectedCategoryId ? String(selectedCategoryId) : allCategoriesValue)
        setPriceMin("")
        setPriceMax("")
        onFilterChange?.(selectedCategoryId ? { categoryId: selectedCategoryId } : {})
    }

    const handlePageChange = (page: number) => {
        onPageChange(page)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside>
                    <form
                        onSubmit={handleSubmitFilters}
                        className="sticky top-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-900"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-bold text-brand2 dark:text-brand">{t("auction.list.filterTitle")}</h2>
                            <Search className="size-4 text-muted-foreground" />
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground" htmlFor="product-keyword">
                                    {t("auction.list.keyword")}
                                </label>
                                <Input
                                    id="product-keyword"
                                    type="text"
                                    placeholder={t("auction.list.searchPlaceholder")}
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">{t("auction.list.category")}</label>
                                <Select
                                    value={categoryValue}
                                    onValueChange={setCategoryValue}
                                    disabled={Boolean(selectedCategoryId)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("auction.list.allCategories")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!selectedCategoryId && (
                                            <SelectItem value={allCategoriesValue}>{t("auction.list.allCategories")}</SelectItem>
                                        )}
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">{t("auction.list.startPrice")}</label>
                                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder={t("auction.list.min")}
                                        value={priceMin}
                                        onChange={(event) => setPriceMin(event.target.value)}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder={t("auction.list.max")}
                                        value={priceMax}
                                        onChange={(event) => setPriceMax(event.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button type="submit" className="bg-brand hover:bg-brand-hover">
                                    {t("common.apply")}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleClearFilters}>
                                    {t("common.clear")}
                                </Button>
                            </div>
                        </div>
                    </form>
                </aside>

                <main>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-brand2 dark:text-brand">
                                {title ?? t("auction.list.title")}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("auction.list.showing", {
                                    first: formatNumber(firstItemIndex),
                                    last: formatNumber(lastItemIndex),
                                    total: formatNumber(totalItems),
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{t("auction.list.sortBy")}</span>
                            <Select defaultValue="newest" onValueChange={onSortChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">{t("auction.list.sortNewest")}</SelectItem>
                                    <SelectItem value="oldest">{t("auction.list.sortOldest")}</SelectItem>
                                    <SelectItem value="price_asc">{t("auction.list.sortPriceAsc")}</SelectItem>
                                    <SelectItem value="price_desc">{t("auction.list.sortPriceDesc")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                                    productId={item.productId}
                                />
                            ))
                        ) : (
                            <div className="col-span-full rounded-lg border bg-white py-12 text-center dark:bg-gray-900">
                                <p className="text-lg font-medium text-foreground">{t("auction.list.emptyTitle")}</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("auction.list.emptyDescription")}
                                </p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(event) => {
                                                event.preventDefault()
                                                if (currentPage > 1) handlePageChange(currentPage - 1)
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {currentPage > 3 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={(event) => {
                                                        event.preventDefault()
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

                                    {[...Array(5)].map((_, index) => {
                                        const pageNum = currentPage - 2 + index
                                        if (pageNum < 1 || pageNum > totalPages) return null

                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        handlePageChange(pageNum)
                                                    }}
                                                    isActive={currentPage === pageNum}
                                                    className={
                                                        currentPage === pageNum
                                                            ? "cursor-pointer bg-brand text-white hover:bg-brand-hover"
                                                            : "cursor-pointer"
                                                    }
                                                >
                                                    {formatNumber(pageNum)}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    })}

                                    {currentPage < totalPages - 2 && (
                                        <>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        handlePageChange(totalPages)
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    {formatNumber(totalPages)}
                                                </PaginationLink>
                                            </PaginationItem>
                                        </>
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(event) => {
                                                event.preventDefault()
                                                if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                            }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
