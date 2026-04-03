import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, ChevronDown, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [myShopOpen, setMyShopOpen] = useState(false);

    const buildSignInLink = () => {
        if (location.pathname === '/signin') return '/signin';
        const currentPath = location.pathname + location.search + location.hash;
        const params = new URLSearchParams();
        params.set('redirectTo', currentPath);
        return `/signin?${params.toString()}`;
    };

    const signInHref = buildSignInLink();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.username) return 'U';
        return user.username.substring(0, 2).toUpperCase();
    };

    return (
        <header className="border-b bg-white dark:bg-gray-900 top-0 z-50 shadow-sm">
            {/* Desktop Header - Hidden on mobile */}
            <div className="hidden lg:block">
                {/* Main Header */}
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold text-brand2 dark:text-brand whitespace-nowrap">
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
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-2 hover:bg-brand/10">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-brand text-white text-sm">
                                                    {getUserInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-brand2 dark:text-brand">
                                                {user?.username}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium">{user?.username}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link to="/profile" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to={signInHref}>
                                    <Button className="bg-brand font-bold hover:bg-brand-hover dark:bg-brand-hover dark:hover:bg-brand">
                                        <User />
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="">
                    <div className="container mx-auto px-4">
                        <nav className="grid grid-cols-5 gap-1">
                            {/* Category - DropdownMenu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-white bg-brand2 uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center gap-2 text-lg font-semibold w-full">
                                        Category
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 h-96" align="start">
                                    <ScrollArea className="">
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/clothing" className="px-4 py-2 text-xl cursor-pointer">
                                                Clothing
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/electronics" className="px-4 py-2 text-xl cursor-pointer">
                                                Electronics
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/art" className="px-4 py-2 text-xl cursor-pointer">
                                                Art
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/collectibles" className="px-4 py-2 text-xl cursor-pointer">
                                                Collectibles
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/home" className="px-4 py-2 text-xl cursor-pointer">
                                                For The Home
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/jewelry" className="px-4 py-2 text-xl cursor-pointer">
                                                Jewelry & Gemstones
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/categories/toys" className="px-4 py-2 text-xl cursor-pointer">
                                                Toys & Games
                                            </Link>
                                        </DropdownMenuItem>

                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Feature */}
                            <Link
                                to="/feature"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-lg font-semibold"
                            >
                                Feature
                            </Link>

                            {/* Newly List */}
                            <Link
                                to="/newly-list"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-lg font-semibold"
                            >
                                Newly List
                            </Link>

                            {/* MyShop - DropdownMenu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-white bg-brand2 uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center gap-2 text-lg font-semibold w-full">
                                        MyShop
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 h-96" align="start">
                                    <ScrollArea className="h-72">
                                        <DropdownMenuItem asChild>
                                            <Link to="/myshop/selling" className="px-4 py-2 text-xl cursor-pointer">
                                                My Selling Items
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/myshop/bidding" className="px-4 py-2 text-xl cursor-pointer">
                                                My Bidding Items
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/myshop/watchlist" className="px-4 py-2 text-xl cursor-pointer">
                                                My Watchlist
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/myshop/won" className="px-4 py-2 text-xl cursor-pointer">
                                                Items Won
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to="/myshop/orders" className="px-4 py-2 text-xl cursor-pointer">
                                                My Orders
                                            </Link>
                                        </DropdownMenuItem>
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Stories */}
                            <Link
                                to="/stories"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 hover:bg-brand transition-colors flex items-center justify-center text-lg font-semibold"
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
                                    {/* User Section */}
                                    {isAuthenticated ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-brand text-white">
                                                        {getUserInitials()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-brand2 dark:text-brand truncate">
                                                        {user?.username}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                                <Button variant="outline" className="w-full text-lg justify-start">
                                                    <User className="mr-2 h-4 w-4" />
                                                    Profile
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                className="w-full text-lg justify-start"
                                                onClick={() => {
                                                    handleLogout();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link to={signInHref} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-brand text-lg hover:bg-brand-hover">
                                                <User className="mr-2" />
                                                Sign In
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Navigation Items */}
                                    <div className="flex flex-col gap-2">
                                        {/* Category - Collapsible */}
                                        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full text-lg justify-between">
                                                    <p>Category</p>
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                <Link to="/categories/clothing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Clothing
                                                </Link>
                                                <Link to="/categories/electronics" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Electronics
                                                </Link>
                                                <Link to="/categories/art" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Art
                                                </Link>
                                                <Link to="/categories/collectibles" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Collectibles
                                                </Link>
                                                <Link to="/categories/home" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    For The Home
                                                </Link>
                                                <Link to="/categories/jewelry" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Jewelry & Gemstones
                                                </Link>
                                                <Link to="/categories/toys" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg  hover:bg-accent rounded-md">
                                                    Toys & Games
                                                </Link>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/feature" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className='w-full text-lg justify-start'>Feature</Button>
                                        </Link>

                                        <Link to="/newly-list" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className='w-full text-lg justify-start'>Newly List</Button>
                                        </Link>

                                        {/* MyShop - Collapsible */}
                                        <Collapsible open={myShopOpen} onOpenChange={setMyShopOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full text-lg justify-between">
                                                    MyShop
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${myShopOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                <Link to="/myshop/selling" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    My Selling Items
                                                </Link>
                                                <Link to="/myshop/bidding" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    My Bidding Items
                                                </Link>
                                                <Link to="/myshop/watchlist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    My Watchlist
                                                </Link>
                                                <Link to="/myshop/won" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    Items Won
                                                </Link>
                                                <Link to="/myshop/orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-lg hover:bg-accent rounded-md">
                                                    My Orders
                                                </Link>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/stories" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full text-lg justify-start">
                                                Stories
                                            </Button>
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
