import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MapPin, User2 } from "lucide-react";
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
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-brand2 dark:text-white flex items-center gap-2">
                        <User2 className="h-7 w-7 text-brand" />
                        My Profile
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        View and manage your account information, addresses and activity.
                    </p>
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

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-700 dark:text-gray-200">Username</p>
                                            <p className="text-gray-500 dark:text-gray-400">{profile?.username || user?.username || "-"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-700 dark:text-gray-200">Email</p>
                                            <p className="text-gray-500 dark:text-gray-400">{profile?.email || user?.email || "-"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-700 dark:text-gray-200">Phone</p>
                                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{profile?.phone || "-"}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-700 dark:text-gray-200">Location</p>
                                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {profile?.city || profile?.country
                                                        ? `${profile?.city || ""}${profile?.city && profile?.country ? ", " : ""}${profile?.country || ""}`
                                                        : "-"}
                                                </span>
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
                        <CardFooter className="justify-between text-xs text-gray-500 dark:text-gray-400 border-t mt-2 pt-4">
                            <span>Member since 2026</span>
                            <span>AuctionShop · Secure marketplace</span>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;