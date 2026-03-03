import { Link } from 'react-router-dom';
import { Search, User, Menu, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [myShopOpen, setMyShopOpen] = useState(false);
    return (
        <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
            {/* Desktop Header - Hidden on mobile */}
            <div className="hidden lg:block">
                {/* Main Header */}
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold text-brand dark:text-brand whitespace-nowrap">
                            AuctionShop
                        </Link>

                        {/* Search Bar - chiếm phần lớn không gian */}
                        <div className="flex-1 max-w-2xl">
                            <div className='relative'>
                                <Input
                                    type="text"
                                    placeholder="Search for items..."
                                    className="pr-12 rounded-full"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-0 top-0 rounded-r-full w-1/12 bg-brand hover:bg-brand-hover dark:bg-brand-hover dark:hover:bg-brand"
                                >
                                    <Search />
                                </Button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center">
                            <ThemeToggle />
                            <Link to="/signin">
                                <Button className="bg-brand font-bold hover:bg-brand-hover dark:bg-brand-hover dark:hover:bg-brand">
                                    <User />
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="">
                    <div className="container mx-auto px-4">
                        <nav className="grid grid-cols-5 gap-1">
                            {/* Category - Collapsible */}
                            <div className="relative">
                                <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                                    <CollapsibleTrigger asChild>
                                        <button className="text-white bg-brand2 uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center gap-2 text-sm font-semibold w-full">
                                            Category
                                            <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="absolute top-full left-0 z-50 w-72 bg-white dark:bg-gray-800 border rounded-md shadow-lg mt-1">
                                        <div className="p-1">
                                            <Link to="/categories/clothing" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Clothing
                                            </Link>
                                            <Link to="/categories/electronics" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Electronics
                                            </Link>
                                            <Link to="/categories/art" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Art
                                            </Link>
                                            <Link to="/categories/collectibles" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Collectibles
                                            </Link>
                                            <Link to="/categories/home" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                For The Home
                                            </Link>
                                            <Link to="/categories/jewelry" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Jewelry & Gemstones
                                            </Link>
                                            <Link to="/categories/toys" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Toys & Games
                                            </Link>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>

                            {/* Feature */}
                            <Link
                                to="/feature"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-sm font-semibold"
                            >
                                Feature
                            </Link>

                            {/* Newly List */}
                            <Link
                                to="/newly-list"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-sm font-semibold"
                            >
                                Newly List
                            </Link>

                            {/* MyShop - Collapsible */}
                            <div className="relative">
                                <Collapsible open={myShopOpen} onOpenChange={setMyShopOpen}>
                                    <CollapsibleTrigger asChild>
                                        <button className="text-white bg-brand2 uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center gap-2 text-sm font-semibold w-full">
                                            MyShop
                                            <ChevronDown className={`h-4 w-4 transition-transform ${myShopOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="absolute top-full left-0 z-50 w-72 bg-white dark:bg-gray-800 border rounded-md shadow-lg mt-1">
                                        <div className="p-1">
                                            <Link to="/myshop/selling" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                My Selling Items
                                            </Link>
                                            <Link to="/myshop/bidding" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                My Bidding Items
                                            </Link>
                                            <Link to="/myshop/watchlist" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                My Watchlist
                                            </Link>
                                            <Link to="/myshop/won" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                Items Won
                                            </Link>
                                            <Link to="/myshop/orders" className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                My Orders
                                            </Link>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>

                            {/* Stories */}
                            <Link
                                to="/stories"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 hover:bg-brand transition-colors flex items-center justify-center text-sm font-semibold"
                            >
                                Stories
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile Header - Shown on mobile only */}
            <div className="lg:hidden">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Mobile Menu (Left) */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-6">
                                    {/* Sign In Button */}
                                    <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-brand hover:bg-brand-hover">
                                            <User className="mr-2" />
                                            Sign In
                                        </Button>
                                    </Link>

                                    {/* Navigation Items */}
                                    <div className="flex flex-col gap-2">
                                        {/* Category - Collapsible */}
                                        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <p className='text-center'>Category</p>
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                <Link to="/categories/clothing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Clothing
                                                </Link>
                                                <Link to="/categories/electronics" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Electronics
                                                </Link>
                                                <Link to="/categories/art" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Art
                                                </Link>
                                                <Link to="/categories/collectibles" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Collectibles
                                                </Link>
                                                <Link to="/categories/home" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    For The Home
                                                </Link>
                                                <Link to="/categories/jewelry" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Jewelry & Gemstones
                                                </Link>
                                                <Link to="/categories/toys" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-accent rounded-md">
                                                    Toys & Games
                                                </Link>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/feature" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline">Feature</Button>
                                        </Link>

                                        <Link to="/newly-list" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline">Newly List</Button>
                                        </Link>

                                        {/* MyShop - Collapsible */}
                                        <Collapsible open={myShopOpen} onOpenChange={setMyShopOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    MyShop
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${myShopOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                <Link to="/myshop/selling" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-center hover:bg-accent rounded-md">
                                                    My Selling Items
                                                </Link>
                                                <Link to="/myshop/bidding" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-center hover:bg-accent rounded-md">
                                                    My Bidding Items
                                                </Link>
                                                <Link to="/myshop/watchlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-center hover:bg-accent rounded-md">
                                                    My Watchlist
                                                </Link>
                                                <Link to="/myshop/won" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-center hover:bg-accent rounded-md">
                                                    Items Won
                                                </Link>
                                                <Link to="/myshop/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm text-center hover:bg-accent rounded-md">
                                                    My Orders
                                                </Link>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/stories" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline">Stories</Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Logo (Center) */}
                        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-brand dark:text-brand whitespace-nowrap">
                            AuctionShop
                        </Link>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            {/* Search Icon */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchExpanded(!searchExpanded)}
                            >
                                {searchExpanded ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Expandable Search Bar */}
                    {searchExpanded && (
                        <div className="mt-3 pb-2 animate-in slide-in-from-top-2 duration-300">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search for items..."
                                    className="pr-12 rounded-full"
                                    autoFocus
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-0 top-0 rounded-r-full bg-brand hover:bg-brand-hover"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}
