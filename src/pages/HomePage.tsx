import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AuctionCard from '@/components/auction/AuctionCard';
import { ArrowRight, Shirt, Monitor, Palette, Star, Home as HomeIcon, Music, Gamepad2, Truck, Zap, Clock } from 'lucide-react';

export default function HomePage() {
    // Mock data - sẽ thay bằng API call sau
    const featuredItems = [
        {
            id: 1,
            title: 'BEST PRICE IGI 1.52Ctw Diamonds (1.02Ct G/SI2 Center) 14KWG Ring Set',
            image: '/src/assets/demo.jpg',
            currentBid: 3133.00,
            bids: 0,
            timeRemaining: '2d 5h',
            isBuyNow: true,
            buyNowPrice: 3133.00,
            hasOnecentShipping: true,
        },
        {
            id: 2,
            title: '14K Gold With Freshwater Pearl Vintage Ring (3.3g)',
            image: 'https://placehold.co/400x300/fff3e0/f57c00?text=Pearl+Ring',
            currentBid: 71.00,
            bids: 15,
            timeRemaining: '1d 8h',
        },
        {
            id: 3,
            title: 'Pad & Quill black and brown leather Messenger Laptop Satchel Travel Bag',
            image: 'https://placehold.co/400x300/efebe9/5d4037?text=Leather+Bag',
            currentBid: 12.99,
            bids: 1,
            timeRemaining: '3d 8h',
            hasOnecentShipping: true,
        },
        {
            id: 4,
            title: 'Vintage Ever-Swiss WORKING 17 Jewels Shock Resistant Pocket Watch',
            image: 'https://placehold.co/400x300/fce4ec/c2185b?text=Pocket+Watch',
            currentBid: 37.00,
            bids: 15,
            timeRemaining: '7h 32m',
        },
        {
            id: 5,
            title: '24lb Untested Jewelry Grab Box',
            image: 'https://placehold.co/400x300/f3e5f5/7b1fa2?text=Jewelry+Box',
            currentBid: 369.00,
            bids: 12,
            timeRemaining: '1d 8h',
        },
        {
            id: 6,
            title: '10 Piece Set of Marked Dirigold Regal Pattern Flatware Cutlery (14.7oz)',
            image: 'https://placehold.co/400x300/e8f5e9/388e3c?text=Flatware+Set',
            currentBid: 12.99,
            bids: 0,
            timeRemaining: '8h 6m',
            hasOnecentShipping: true,
        },
    ];

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
                    <Link to="/featured" className="text-brand dark:text-brand hover:underline flex items-center gap-1">
                        View All Featured Items
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredItems.map((item) => (
                        <AuctionCard key={item.id} {...item} />
                    ))}
                </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {featuredItems.slice(0, 4).map((item) => (
                            <AuctionCard key={item.id} {...item} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
