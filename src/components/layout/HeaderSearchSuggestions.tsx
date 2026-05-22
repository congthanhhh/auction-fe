import type { ProductResponse } from '@/types/auction';
import { formatNumber } from '@/lib/utils';

interface HeaderSearchSuggestionsProps {
    products: ProductResponse[];
    isLoading: boolean;
    keyword: string;
    isOpen: boolean;
    onSelectProduct: (product: ProductResponse) => void;
}

export function HeaderSearchSuggestions({
    products,
    isLoading,
    keyword,
    isOpen,
    onSelectProduct,
}: HeaderSearchSuggestionsProps) {
    const trimmedKeyword = keyword.trim();

    if (!isOpen || !trimmedKeyword) {
        return null;
    }

    return (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-gray-900">
            {isLoading ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                    Đang tìm sản phẩm...
                </div>
            ) : products.length > 0 ? (
                <div className="max-h-80 overflow-y-auto py-1">
                    {products.map((product) => (
                        <button
                            key={product.id}
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent focus:bg-accent focus:outline-none"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onSelectProduct(product)}
                        >
                            <img
                                src={product.images[0]?.url || 'https://placehold.co/80x80?text=No+Image'}
                                alt={product.name}
                                className="h-12 w-12 flex-none rounded-md border object-cover"
                            />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-foreground">
                                    {product.name}
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                    {product.category.name}
                                </span>
                            </span>
                            <span className="flex-none text-sm font-semibold text-brand2 dark:text-brand">
                                {formatNumber(product.startPrice)} đ
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                    Không tìm thấy sản phẩm phù hợp.
                </div>
            )}
        </div>
    );
}
