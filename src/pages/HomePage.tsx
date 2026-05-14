import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuctionCard from '@/components/auction/AuctionCard';
import { ArrowRight, Truck, Zap, Clock } from 'lucide-react';
import { auctionService } from '@/services/auctionService';
import { categoryService } from '@/services/categoryService';
import type { AuctionSessionResponse, CategoryResponse } from '@/types/auction';
import { calculateTimeRemaining } from '@/lib/utils';
import { useAuctionDetailStore } from '@/stores/auctionDetailStore';

export default function HomePage() {
    const { t } = useTranslation();
    const [featuredItems, setFeaturedItems] = useState<AuctionSessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const { bidCount } = useAuctionDetailStore();

    useEffect(() => {
        const fetchActiveAuctions = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await auctionService.getActiveAuctionSessionsDesc(1, 8);
                setFeaturedItems(response.data ?? []);
            } catch (err) {
                console.error('Failed to fetch active auctions:', err);
                setError(t('home.loadAuctionsError'));
                setFeaturedItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveAuctions();
    }, [t]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories(1, 20);
                setCategories(response.data ?? []);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    const categoryBgClasses = [
        'bg-rose-50 border-rose-100',
        'bg-orange-50 border-orange-100',
        'bg-amber-50 border-amber-100',
        'bg-emerald-50 border-emerald-100',
        'bg-sky-50 border-sky-100',
        'bg-indigo-50 border-indigo-100',
        'bg-fuchsia-50 border-fuchsia-100',
        'bg-pink-50 border-pink-100',
        'bg-lime-50 border-lime-100',
        'bg-cyan-50 border-cyan-100',
        'bg-teal-50 border-teal-100',
        'bg-slate-50 border-slate-200',
    ] as const;

    const getCategoryBgClass = (index: number) => {
        return categoryBgClasses[index % categoryBgClasses.length];
    };

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero Banner*/}
            <div className="container mx-auto px-4">
                <div className="py-15 bg-linear-to-r from-brand to-brand-hover dark:from-brand-hover dark:to-brand-hover text-white">
                    <div className="max-w-2xl px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {t('home.heroTitle')}
                        </h1>
                        <p className="text-xl mb-6">
                            {t('home.heroDescription')}
                        </p>
                        <Button size="lg" className="bg-white text-brand hover:bg-gray-100 font-semibold">
                            {t('home.shopNow')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Featured Items Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">{t('home.featuredItems')}</h2>
                    <Link to="/view-all-featured" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                        {t('home.viewAllFeatured')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">{t('home.loadingAuctions')}</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    </div>
                ) : featuredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">{t('home.noActiveAuctions')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredItems.map((auction) => {
                            const hasBids = auction.currentPrice > auction.startPrice || auction.highestBidder !== null;

                            return (
                                <AuctionCard
                                    key={auction.id}
                                    id={auction.id}
                                    title={auction.product.name}
                                    image={auction.product.images[0]?.url || "https://picsum.photos/200"}
                                    currentBid={auction.currentPrice}
                                    bids={bidCount}
                                    productId={auction.product.id}
                                    timeRemaining={calculateTimeRemaining(auction.endTime)}
                                    isBuyNow={!!auction.buyNowPrice && !hasBids}
                                    buyNowPrice={auction.buyNowPrice || undefined}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Shop Top Categories - giống shopgoodwill */}
            <div className="bg-white dark:bg-gray-800 py-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col justify-center items-center mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">{t('home.topCategories')}</h2>
                        <Link to="/categories" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                            {t('home.viewAllCategories')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {categories.slice(0, 12).map((category, index) => (
                            <Card
                                key={category.id}
                                className={`group relative overflow-hidden border bg-background hover:border-brand hover:shadow-md transition-all ${getCategoryBgClass(index)}`}
                            >
                                <Link to={`/categories/${category.id}`}>
                                    <CardContent className="p-5 text-center flex h-full flex-col items-center justify-center">
                                        <h3 className="text-xl font-semibold text-foreground group-hover:text-brand line-clamp-2">
                                            {category.name}
                                        </h3>
                                        <span className="mt-3 h-0.5 w-8 rounded-full bg-muted group-hover:bg-brand" />
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Promotional Sections*/}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1¢ Shipping */}
                    <Card className="border-2 border-brand dark:border-brand bg-brand/10 dark:bg-brand/10">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Truck className="h-12 w-12 text-brand dark:text-brand" />
                            </div>
                            <CardTitle className="text-2xl">{t('home.shippingTitle')}</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                {t('home.shippingDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white dark:border-brand dark:text-brand">
                                {t('home.shippingButton')}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Buy It Now */}
                    <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Zap className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl">{t('home.buyNowTitle')}</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                {t('home.buyNowDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-400">
                                {t('home.buyNowButton')}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Last Chance */}
                    <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Clock className="h-12 w-12 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl">{t('home.lastChanceTitle')}</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                {t('home.lastChanceDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400">
                                {t('home.lastChanceButton')}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Recommended Section */}
            <div className="bg-white dark:bg-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">{t('home.recommended')}</h2>
                        <Link to="/recommended" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                            {t('home.viewAllRecommended')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">{t('home.loadingRecommendations')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredItems.slice(0, 4).map((auction) => {
                                const hasBids = auction.currentPrice > auction.startPrice || auction.highestBidder !== null;
                                const bidCount = hasBids ? 1 : 0;

                                return (
                                    <AuctionCard
                                        key={auction.id}
                                        id={auction.id}
                                        title={auction.product.name}
                                        image={auction.product.images[0]?.url || 'https://placehold.co/400x300/e0e0e0/666?text=No+Image'}
                                        currentBid={auction.currentPrice}
                                        bids={bidCount}
                                        productId={auction.product.id}
                                        timeRemaining={calculateTimeRemaining(auction.endTime)}
                                        isBuyNow={!!auction.buyNowPrice && !hasBids}
                                        buyNowPrice={auction.buyNowPrice || undefined}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
