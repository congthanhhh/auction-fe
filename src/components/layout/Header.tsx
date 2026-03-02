import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
    return (
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
            {/* Top Bar */}
            <div className="bg-blue-600 dark:bg-blue-800 text-white text-sm">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <div className="flex gap-4">
                        <Link to="/help" className="hover:underline">Help Center</Link>
                        <Link to="/about" className="hover:underline">About Us</Link>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/sell" className="hover:underline">Start Selling</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        AuctionSite
                    </Link>

                    {/* Search Bar - chiếm phần lớn không gian */}
                    <div className="flex-1 max-w-3xl">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search for items..."
                                className="pr-12 h-12"
                            />
                            <Button
                                size="icon"
                                className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative">
                            <Heart className="h-6 w-6" />
                            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 flex items-center justify-center">
                                0
                            </Badge>
                        </Button>
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-6 w-6" />
                            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-5 h-5 flex items-center justify-center">
                                0
                            </Badge>
                        </Button>
                        <Link to="/login">
                            <Button variant="outline" className="gap-2">
                                <User className="h-5 w-5" />
                                Login
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                                Register
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <nav className="flex gap-6 py-3 overflow-x-auto">
                        <Link to="/categories/clothing" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Clothing
                        </Link>
                        <Link to="/categories/electronics" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Computers & Electronics
                        </Link>
                        <Link to="/categories/art" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Art
                        </Link>
                        <Link to="/categories/collectibles" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Collectibles
                        </Link>
                        <Link to="/categories/home" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            For The Home
                        </Link>
                        <Link to="/categories/jewelry" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Jewelry & Gemstones
                        </Link>
                        <Link to="/categories/toys" className="text-sm hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                            Toys & Games
                        </Link>
                        <Link to="/categories/all" className="text-sm font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            View All Categories
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
