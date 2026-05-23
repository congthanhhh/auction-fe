import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, ChevronDown, X, LogOut, ShieldCheck } from 'lucide-react';
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
import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import type { CategoryResponse, ProductResponse } from '@/types/auction';
import { NotificationBell } from './NotificationBell';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { HeaderSearchSuggestions } from './HeaderSearchSuggestions';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { isAuthenticated, user, logoutWithApi } = useAuthStore();
    const { isAdmin } = useAdminAuth();
    const requireAuth = useRequireAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [myShopOpen, setMyShopOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<ProductResponse[]>([]);
    const [isLoadingSearchSuggestions, setIsLoadingSearchSuggestions] = useState(false);
    const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false);

    const buildSignInLink = () => {
        if (location.pathname === '/signin') return '/signin';
        const currentPath = location.pathname + location.search + location.hash;
        const params = new URLSearchParams();
        params.set('redirectTo', currentPath);
        return `/signin?${params.toString()}`;
    };

    const signInHref = buildSignInLink();

    const handleLogout = async () => {
        await logoutWithApi();
        navigate('/signin');
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const keyword = searchKeyword.trim();

        if (!keyword) {
            navigate('/view-all-featured');
            setSearchExpanded(false);
            setMobileMenuOpen(false);
            return;
        }

        const params = new URLSearchParams();
        params.set('keyword', keyword);
        navigate(`/view-all-featured?${params.toString()}`);
        setSearchExpanded(false);
        setMobileMenuOpen(false);
        setIsSearchSuggestionsOpen(false);
    };

    const handleSearchInputChange = (value: string) => {
        setSearchKeyword(value);
        setIsSearchSuggestionsOpen(Boolean(value.trim()));
    };

    const handleSelectSearchProduct = (product: ProductResponse) => {
        const params = new URLSearchParams();
        params.set('keyword', product.name);
        setSearchKeyword(product.name);
        setIsSearchSuggestionsOpen(false);
        setSearchExpanded(false);
        setMobileMenuOpen(false);
        navigate(`/view-all-featured?${params.toString()}`);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                setCategoryError(null);
                const response = await categoryService.getCategories(1, 50);
                setCategories(response.data ?? []);
            } catch (err) {
                console.error('Failed to fetch categories in header:', err);
                setCategories([]);
                setCategoryError(t('navigation.categoryLoadError'));
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [t]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchKeyword(params.get('keyword') ?? '');
    }, [location.search]);

    useEffect(() => {
        const keyword = searchKeyword.trim();

        if (!keyword) {
            setSearchSuggestions([]);
            setIsLoadingSearchSuggestions(false);
            return;
        }

        let isMounted = true;
        const timeoutId = window.setTimeout(async () => {
            try {
                setIsLoadingSearchSuggestions(true);
                const response = await productService.searchProducts(
                    {
                        keyword,
                        status: 'ACTIVE',
                        isActive: true,
                        sort: 'newest',
                    },
                    1,
                    6,
                );

                if (isMounted) {
                    setSearchSuggestions(response.data ?? []);
                }
            } catch (err) {
                console.error('Failed to fetch header search suggestions:', err);
                if (isMounted) {
                    setSearchSuggestions([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSearchSuggestions(false);
                }
            }
        }, 250);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [searchKeyword]);

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
                            {t('common.appName')}
                        </Link>

                        {/* Search Bar - chiếm phần lớn không gian */}
                        <form className="flex-1 max-w-2xl" onSubmit={handleSearchSubmit}>
                            <div className='relative'>
                                <Input
                                    type="text"
                                    placeholder={t('navigation.searchPlaceholder')}
                                    className="pr-12 rounded-full"
                                    value={searchKeyword}
                                    onBlur={() => setTimeout(() => setIsSearchSuggestionsOpen(false), 120)}
                                    onChange={(event) => handleSearchInputChange(event.target.value)}
                                    onFocus={() => setIsSearchSuggestionsOpen(Boolean(searchKeyword.trim()))}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-0 top-0 rounded-r-full w-1/12 bg-brand hover:bg-brand-hover dark:bg-brand-hover dark:hover:bg-brand"
                                >
                                    <Search />
                                </Button>
                                <HeaderSearchSuggestions
                                    products={searchSuggestions}
                                    isLoading={isLoadingSearchSuggestions}
                                    keyword={searchKeyword}
                                    isOpen={isSearchSuggestionsOpen}
                                    onSelectProduct={handleSelectSearchProduct}
                                />
                            </div>
                        </form>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageSwitcher />
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <Button asChild className="bg-brand2 font-bold hover:bg-brand dark:bg-brand-hover dark:hover:bg-brand">
                                            <Link to="/admin">
                                                <ShieldCheck className="h-4 w-4" />
                                                Admin
                                            </Link>
                                        </Button>
                                    )}
                                    <NotificationBell />
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
                                                    {t('navigation.profile')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    void handleLogout();
                                                }}
                                                className="cursor-pointer text-red-600 focus:text-red-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {t('navigation.logout')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <Link to={signInHref}>
                                    <Button className="bg-brand font-bold hover:bg-brand-hover dark:bg-brand-hover dark:hover:bg-brand">
                                        <User />
                                        {t('navigation.signIn')}
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
                                        {t('navigation.category')}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 h-96" align="start">
                                    <ScrollArea className="">
                                        {isLoadingCategories && (
                                            <DropdownMenuItem disabled className="px-4 py-2 text-base">
                                                {t('navigation.loadingCategories')}
                                            </DropdownMenuItem>
                                        )}
                                        {!isLoadingCategories && categoryError && (
                                            <DropdownMenuItem disabled className="px-4 py-2 text-base text-red-500">
                                                {categoryError}
                                            </DropdownMenuItem>
                                        )}
                                        {!isLoadingCategories && !categoryError && categories.length === 0 && (
                                            <DropdownMenuItem disabled className="px-4 py-2 text-base">
                                                {t('navigation.noCategories')}
                                            </DropdownMenuItem>
                                        )}
                                        {!isLoadingCategories && !categoryError && categories.map((category) => (
                                            <DropdownMenuItem asChild key={category.id}>
                                                <Link to={`/categories/${category.id}`} className="px-4 py-2 text-xl cursor-pointer">
                                                    {category.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}

                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Feature */}
                            <Link
                                to="/view-all-featured"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-lg font-semibold"
                            >
                                {t('navigation.feature')}
                            </Link>

                            {/* Newly List */}
                            <Link
                                to="#"
                                className="bg-brand2 text-white uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center text-lg font-semibold"
                            >
                                {t('navigation.newlyList')}
                            </Link>

                            {/* My Auction - DropdownMenu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="text-white bg-brand2 uppercase tracking-widest py-3 border-r border-white/20 hover:bg-brand transition-colors flex items-center justify-center gap-2 text-lg font-semibold w-full">
                                        {t('navigation.myAuction')}
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72" align="start">
                                    <ScrollArea className="h-72">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/profile"
                                                className="px-4 py-2 text-xl cursor-pointer"
                                                onClick={(e) => {
                                                    if (!isAuthenticated) {
                                                        e.preventDefault();
                                                        requireAuth();
                                                    }
                                                }}
                                            >
                                                {t('navigation.myProfile')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/my-joined"
                                                className="px-4 py-2 text-xl cursor-pointer"
                                                onClick={(e) => {
                                                    if (!isAuthenticated) {
                                                        e.preventDefault();
                                                        requireAuth();
                                                    }
                                                }}
                                            >
                                                {t('navigation.myJoinedAuctions')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/my-sessions"
                                                className="px-4 py-2 text-xl cursor-pointer"
                                                onClick={(e) => {
                                                    if (!isAuthenticated) {
                                                        e.preventDefault();
                                                        requireAuth();
                                                    }
                                                }}
                                            >
                                                {t('navigation.myAuctionSessions')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/my-invoices"
                                                className="px-4 py-2 text-xl cursor-pointer"
                                                onClick={(e) => {
                                                    if (!isAuthenticated) {
                                                        e.preventDefault();
                                                        requireAuth();
                                                    }
                                                }}
                                            >
                                                {t('navigation.myOrders')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link
                                                to="/my-sales"
                                                className="px-4 py-2 text-xl cursor-pointer"
                                                onClick={(e) => {
                                                    if (!isAuthenticated) {
                                                        e.preventDefault();
                                                        requireAuth();
                                                    }
                                                }}
                                            >
                                                {t('navigation.mySales')}
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
                                {t('navigation.stories')}
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
                                    <SheetTitle>{t('navigation.menu')}</SheetTitle>
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
                                                    {t('navigation.profile')}
                                                </Button>
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                    <Button className="w-full bg-brand2 text-lg justify-start hover:bg-brand">
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Admin
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="destructive"
                                                className="w-full text-lg justify-start"
                                                onClick={() => {
                                                    void handleLogout();
                                                    setMobileMenuOpen(false);
                                                }}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {t('navigation.logout')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link to={signInHref} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-brand text-lg hover:bg-brand-hover">
                                                <User className="mr-2" />
                                                {t('navigation.signIn')}
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Navigation Items */}
                                    <div className="flex flex-col gap-2">
                                        {/* Category - Collapsible */}
                                        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full text-lg justify-between">
                                                    <p>{t('navigation.category')}</p>
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                {isLoadingCategories && (
                                                    <p className="px-4 py-2 text-sm text-muted-foreground">
                                                        {t('navigation.loadingCategories')}
                                                    </p>
                                                )}
                                                {!isLoadingCategories && categoryError && (
                                                    <p className="px-4 py-2 text-sm text-red-500">
                                                        {categoryError}
                                                    </p>
                                                )}
                                                {!isLoadingCategories && !categoryError && categories.length === 0 && (
                                                    <p className="px-4 py-2 text-sm text-muted-foreground">
                                                        {t('navigation.noCategories')}
                                                    </p>
                                                )}
                                                {!isLoadingCategories && !categoryError && categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        to={`/categories/${category.id}`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className="block px-4 py-2 text-lg hover:bg-accent rounded-md"
                                                    >
                                                        {category.name}
                                                    </Link>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/feature" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className='w-full text-lg justify-start'>{t('navigation.feature')}</Button>
                                        </Link>

                                        <Link to="/newly-list" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className='w-full text-lg justify-start'>{t('navigation.newlyList')}</Button>
                                        </Link>

                                        {/* My Auction - Collapsible */}
                                        <Collapsible open={myShopOpen} onOpenChange={setMyShopOpen}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full text-lg justify-between">
                                                    {t('navigation.myAuction')}
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${myShopOpen ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-1">
                                                <Link
                                                    to="/my-joined"
                                                    onClick={(e) => {
                                                        setMobileMenuOpen(false);
                                                        if (!isAuthenticated) { e.preventDefault(); requireAuth(); }
                                                    }}
                                                    className="block px-4 py-2 text-lg hover:bg-accent rounded-md"
                                                >
                                                    {t('navigation.myJoinedAuctions')}
                                                </Link>
                                                <Link
                                                    to="/my-sessions"
                                                    onClick={(e) => {
                                                        setMobileMenuOpen(false);
                                                        if (!isAuthenticated) { e.preventDefault(); requireAuth(); }
                                                    }}
                                                    className="block px-4 py-2 text-lg hover:bg-accent rounded-md"
                                                >
                                                    {t('navigation.myAuctionSessions')}
                                                </Link>
                                                <Link
                                                    to="/my-invoices"
                                                    onClick={(e) => {
                                                        setMobileMenuOpen(false);
                                                        if (!isAuthenticated) { e.preventDefault(); requireAuth(); }
                                                    }}
                                                    className="block px-4 py-2 text-lg hover:bg-accent rounded-md"
                                                >
                                                    {t('navigation.myOrders')}
                                                </Link>
                                                <Link
                                                    to="/my-sales"
                                                    onClick={(e) => {
                                                        setMobileMenuOpen(false);
                                                        if (!isAuthenticated) { e.preventDefault(); requireAuth(); }
                                                    }}
                                                    className="block px-4 py-2 text-lg hover:bg-accent rounded-md"
                                                >
                                                    {t('navigation.mySales')}
                                                </Link>
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <Link to="/stories" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full text-lg justify-start">
                                                {t('navigation.stories')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Logo (Center) */}
                        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-brand dark:text-brand whitespace-nowrap">
                            {t('common.appName')}
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
                            {isAuthenticated && <NotificationBell />}
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Expandable Search Bar */}
                    {searchExpanded && (
                        <form className="mt-3 pb-2 animate-in slide-in-from-top-2 duration-300" onSubmit={handleSearchSubmit}>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder={t('navigation.searchPlaceholder')}
                                    className="pr-12 rounded-full"
                                    value={searchKeyword}
                                    onBlur={() => setTimeout(() => setIsSearchSuggestionsOpen(false), 120)}
                                    onChange={(event) => handleSearchInputChange(event.target.value)}
                                    onFocus={() => setIsSearchSuggestionsOpen(Boolean(searchKeyword.trim()))}
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-0 top-0 rounded-r-full bg-brand hover:bg-brand-hover"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                                <HeaderSearchSuggestions
                                    products={searchSuggestions}
                                    isLoading={isLoadingSearchSuggestions}
                                    keyword={searchKeyword}
                                    isOpen={isSearchSuggestionsOpen}
                                    onSelectProduct={handleSelectSearchProduct}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </header >
    );
}
