import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuctionCard from '@/components/auction/AuctionCard';
import { ArrowRight, Shirt, Monitor, Palette, Star, Home as HomeIcon, Music, Gamepad2, Truck, Zap, Clock } from 'lucide-react';
import { auctionService } from '@/services/auctionService';
import type { AuctionSessionResponse } from '@/types/auction';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);

// Helper function to calculate time remaining
function calculateTimeRemaining(endTime: string): string {
    const now = dayjs();
    const end = dayjs(endTime);
    const diffMs = end.diff(now);

    if (diffMs <= 0) return 'Ended';

    const timeDuration = dayjs.duration(diffMs);
    const days = Math.floor(timeDuration.asDays());
    const hours = timeDuration.hours();
    const minutes = timeDuration.minutes();

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export default function HomePage() {
    const [featuredItems, setFeaturedItems] = useState<AuctionSessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActiveAuctions = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await auctionService.getActiveAuctionSessionsDesc(1, 8);
                setFeaturedItems(response.data ?? []);
            } catch (err) {
                console.error('Failed to fetch active auctions:', err);
                setError('Failed to load auction items. Please try again later.');
                setFeaturedItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveAuctions();
    }, []);

    const categories = [
        { name: 'Clothing', icon: Shirt, link: '/categories/clothing' },
        { name: 'Electronics', icon: Monitor, link: '/categories/electronics' },
        { name: 'Art', icon: Palette, link: '/categories/art' },
        { name: 'Collectibles', icon: Star, link: '/categories/collectibles' },
        { name: 'For The Home', icon: HomeIcon, link: '/categories/home' },
        { name: 'Musical Instruments', icon: Music, link: '/categories/music' },
        { name: 'Toys & Games', icon: Gamepad2, link: '/categories/toys' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900">
            {/* Hero Banner*/}
            <div className="container mx-auto px-4">
                <div className="py-15 bg-linear-to-r from-brand to-brand-hover dark:from-brand-hover dark:to-brand-hover text-white">
                    <div className="max-w-2xl px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            JEWELRY WORTH GIVING OR KEEPING
                        </h1>
                        <p className="text-xl mb-6">
                            Discover unique treasures at unbeatable prices
                        </p>
                        <Button size="lg" className="bg-white text-brand hover:bg-gray-100 font-semibold">
                            SHOP NOW
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Featured Items Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">FEATURED ITEMS</h2>
                    <Link to="/view-all-featured" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                        View All Featured Items
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading auction items...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    </div>
                ) : featuredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No active auctions available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredItems.map((auction) => {
                            const hasBids = auction.currentPrice > auction.startPrice || auction.highestBidder !== null;
                            const bidCount = hasBids ? 1 : 0; // Backend should provide actual bid count

                            return (
                                <AuctionCard
                                    key={auction.id}
                                    id={auction.id}
                                    title={auction.product.name}
                                    image={auction.product.images[0]?.url || 'https://placehold.co/400x300/e0e0e0/666?text=No+Image'}
                                    currentBid={auction.currentPrice}
                                    bids={bidCount}
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
                        <h2 className="text-2xl font-bold dark:text-white">SHOP TOP CATEGORIES</h2>
                        <Link to="/categories" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                            View All Categories
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card
                                    key={category.name}
                                    className="hover:shadow-lg hover:border-brand dark:hover:border-brand transition-all group"
                                >
                                    <Link to={category.link}>
                                        <CardContent className="p-6 text-center">
                                            <Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground group-hover:text-brand dark:group-hover:text-brand" />
                                            <h3 className="font-semibold text-sm">{category.name}</h3>
                                        </CardContent>
                                    </Link>
                                </Card>
                            );
                        })}
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
                            <CardTitle className="text-2xl">1¢ Shipping</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                Don't let shipping keep you from taking home amazing items
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white dark:border-brand dark:text-brand">
                                Shop 1¢ Shipping Items
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Buy It Now */}
                    <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Zap className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl">Buy It Now</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                Browse items available for purchase today. No bidding!
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-400">
                                Shop Buy It Now Items
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Last Chance */}
                    <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Clock className="h-12 w-12 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl">Last Chance</CardTitle>
                            <CardDescription className="text-base dark:text-gray-300">
                                Limited time remaining – Hurry Up!
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-center">
                            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400">
                                Shop Last Chance Items
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* Recommended Section */}
            <div className="bg-white dark:bg-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">RECOMMENDED FOR YOU</h2>
                        <Link to="/recommended" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                            View All Recommended
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">Loading recommendations...</p>
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
