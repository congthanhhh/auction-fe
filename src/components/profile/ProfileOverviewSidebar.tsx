import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Mail, Star, Edit, Shield, Package, HeartHandshake, Award } from "lucide-react";
import type { UserProfileResponse } from "@/types/user";

interface ProfileOverviewSidebarProps {
    user: { username?: string; email?: string; role?: string } | null;
    profile: UserProfileResponse | null;
}

const ProfileOverviewSidebar = ({ user, profile }: ProfileOverviewSidebarProps) => {
    const displayName = profile?.username || user?.username || "Guest";
    const initials = displayName.slice(0, 2).toUpperCase();
    const email = profile?.email || user?.email || "No email";
    const role = user?.role || "USER";

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="overflow-hidden border-none shadow-sm dark:bg-gray-900/50 backdrop-blur-sm relative">
                {/* Gradient Banner */}
                <div className="h-24 w-full bg-gradient-to-r from-brand to-brand2 dark:from-brand2/80 dark:to-brand/60" />
                
                <CardContent className="px-6 pb-6 pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 mb-4">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-sm bg-white">
                            <AvatarFallback className="bg-gradient-to-br from-brand/20 to-brand/40 text-brand text-2xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        
                        <Button variant="outline" size="sm" className="gap-2 rounded-full hover:bg-brand hover:text-white transition-colors">
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {displayName}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand dark:bg-brand/20">
                                <Award className="h-3 w-3" />
                                {role}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Trusted member of AuctionShop marketplace
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <Mail className="h-4 w-4" />
                            </div>
                            <span>{email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                                <Shield className="h-4 w-4" />
                            </div>
                            <span>Secured Account</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Summary Card */}
            <Card className="border-none shadow-sm dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        Account Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Feedback */}
                        <div className="group p-4 rounded-2xl bg-gray-50 hover:bg-yellow-50 dark:bg-gray-800/50 dark:hover:bg-yellow-900/10 transition-colors border border-transparent hover:border-yellow-100 dark:hover:border-yellow-900/30">
                            <div className="flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500 group-hover:scale-110 transition-transform">
                                    <Star className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Feedback score</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.totalFeedback ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Won */}
                        <div className="group p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 dark:bg-gray-800/50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30">
                            <div className="flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items won</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.itemsWon ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Sold */}
                        <div className="group p-4 rounded-2xl bg-gray-50 hover:bg-rose-50 dark:bg-gray-800/50 dark:hover:bg-rose-900/10 transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30">
                            <div className="flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-500 group-hover:scale-110 transition-transform">
                                    <HeartHandshake className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items sold</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.itemsSold ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Spent */}
                        <div className="group p-4 rounded-2xl bg-gray-50 hover:bg-green-50 dark:bg-gray-800/50 dark:hover:bg-green-900/10 transition-colors border border-transparent hover:border-green-100 dark:hover:border-green-900/30">
                            <div className="flex flex-col gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-500 group-hover:scale-110 transition-transform">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total spent</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate" title={formatCurrency(profile?.totalSpent ?? 0)}>
                                        {formatCurrency(profile?.totalSpent ?? 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileOverviewSidebar;
