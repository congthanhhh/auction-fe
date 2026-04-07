import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Mail, Star, Edit, Shield, Package, HeartHandshake } from "lucide-react";
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
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex items-center gap-4">
                    <Avatar size="lg">
                        <AvatarFallback className="bg-brand text-white text-lg">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-brand2 dark:text-white">
                            {displayName}
                        </CardTitle>
                        <CardDescription>
                            Trusted member of AuctionShop marketplace
                        </CardDescription>
                    </div>
                    <div className="ml-auto">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand" />
                        <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                        <Shield className="h-4 w-4" />
                        <span>Role: {role}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>Feedback score</span>
                        </div>
                        <p className="text-lg font-semibold">{profile?.totalFeedback ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Package className="h-4 w-4" />
                            <span>Items won</span>
                        </div>
                        <p className="text-lg font-semibold">{profile?.itemsWon ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <HeartHandshake className="h-4 w-4" />
                            <span>Items sold</span>
                        </div>
                        <p className="text-lg font-semibold">{profile?.itemsSold ?? 0}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Shield className="h-4 w-4" />
                            <span>Total spent</span>
                        </div>
                        <p className="text-lg font-semibold">{formatCurrency(profile?.totalSpent ?? 0)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileOverviewSidebar;
