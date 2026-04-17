import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { categoryService } from "@/services/categoryService";
import type { CategoryResponse } from "@/types/auction";

export default function Categories() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Lấy "tất cả" category trong một lần gọi, UI không phân trang
                const response = await categoryService.getCategories(1, 1000);
                setCategories(response.data ?? []);
            } catch (err: any) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch categories:", err);
                setError(err?.message || "Không tải được danh sách danh mục.");
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllCategories();
    }, []);

    const categoryBgClasses = [
        "bg-rose-50 border-rose-100",
        "bg-orange-50 border-orange-100",
        "bg-amber-50 border-amber-100",
        "bg-emerald-50 border-emerald-100",
        "bg-sky-50 border-sky-100",
        "bg-indigo-50 border-indigo-100",
        "bg-fuchsia-50 border-fuchsia-100",
        "bg-pink-50 border-pink-100",
        "bg-lime-50 border-lime-100",
        "bg-cyan-50 border-cyan-100",
        "bg-teal-50 border-teal-100",
        "bg-slate-50 border-slate-200",
    ] as const;

    const getCategoryBgClass = (index: number) => {
        return categoryBgClasses[index % categoryBgClasses.length];
    };

    return (
        <div className="bg-white dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-brand2 dark:text-white">
                            All Categories
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse all available categories and their descriptions.
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="text-xs md:text-sm font-medium text-brand hover:underline"
                    >
                        ← Back to Home
                    </Link>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        Loading categories...
                    </div>
                ) : error ? (
                    <div className="py-12 text-center text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                        No categories found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        {categories.map((category, index) => (
                            <Link key={category.id} to={`/categories/${category.id}`}>
                                <Card
                                    className={`h-full border bg-background/60 dark:bg-gray-900/60 hover:border-brand hover:shadow-md transition-all ${getCategoryBgClass(index)}`}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base md:text-lg font-semibold line-clamp-2">
                                            {category.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-xs md:text-sm text-muted-foreground whitespace-pre-line min-h-[3rem]">
                                            {category.description || "No description provided."}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
