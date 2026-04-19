import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, User2, Shield } from "lucide-react";
import { userService } from "@/services/userService";
import type { UserProfileResponse } from "@/types/user";
import ProfileOverviewSidebar from "@/components/profile/ProfileOverviewSidebar";
import ProfileAddressSection from "@/components/profile/ProfileAddressSection";

const Profile = () => {
    const { user } = useAuthStore();

    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setProfileError(null);
                const profileResponse = await userService.getMyProfile();
                setProfile(profileResponse);
            } catch (error) {
                console.error("Failed to load profile:", error);
                setProfileError("Failed to load profile information.");
            } finally {
            }
        };

        fetchData();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-950 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8 relative rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand/5 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-brand2/5 blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col gap-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-brand/10 dark:bg-brand/20 rounded-xl text-brand">
                                <User2 className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            My Profile
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl">
                            Manage your personal information, shipping addresses, security preferences, and track your auction activity.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] gap-6 items-start">
                    {/* Left column: overview + quick stats */}
                    <ProfileOverviewSidebar user={user} profile={profile} />

                    {/* Right column: tabs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Account details</CardTitle>
                            {profileError && (
                                <CardDescription className="text-red-500">
                                    {profileError}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="addresses">Addresses</TabsTrigger>
                                    <TabsTrigger value="activity">Activity</TabsTrigger>
                                    <TabsTrigger value="security">Security</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {/* Username */}
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <User2 className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                                            </div>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white pl-[44px]">
                                                {profile?.username || user?.username || "-"}
                                            </p>
                                        </div>

                                        {/* Email */}
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <User2 className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                            </div>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white pl-[44px]">
                                                {profile?.email || user?.email || "-"}
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                                            </div>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white pl-[44px]">
                                                {profile?.phone || "-"}
                                            </p>
                                        </div>

                                        {/* Location */}
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Location</p>
                                            </div>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white pl-[44px]">
                                                {profile?.city || profile?.country
                                                    ? `${profile?.city || ""}${profile?.city && profile?.country ? ", " : ""}${profile?.country || ""}`
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="addresses" className="space-y-3 text-sm">
                                    <ProfileAddressSection />
                                </TabsContent>

                                <TabsContent value="activity" className="space-y-3 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Recent bidding and selling activity will appear here.
                                    </p>
                                    <Separator />
                                    <p className="text-xs text-gray-400">
                                        Once wired, this section can show your latest bids, items won, and items sold.
                                    </p>
                                </TabsContent>

                                <TabsContent value="security" className="space-y-3 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Manage password and security settings.
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-1">
                                        Change password
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 mt-6 pt-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure marketplace</span>
                            <span>Member since {new Date().getFullYear()}</span>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;