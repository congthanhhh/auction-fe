import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileAddressSection from "@/components/profile/ProfileAddressSection";
import { userService } from "@/services/userService";
import type { UserProfileResponse } from "@/types/user";
import { feedbackService } from "@/services/feedbackService";
import { FeedbackRating, type FeedbackDto } from "@/types/feedback";
import { SimplePagination } from "@/components/common/SimplePagination";
import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Frown,
    KeyRound,
    Mail,
    Meh,
    MessageSquareText,
    Phone,
    Receipt,
    ShieldCheck,
    Smile,
    Star,
    UserRound,
    XCircle,
} from "lucide-react";

const formatDate = (value?: string | null) => {
    if (!value) return "--";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "--"
        : new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
};

const getInitials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message) {
            return message;
        }
    }

    return fallback;
};

const feedbackRatingLabels: Record<FeedbackRating, string> = {
    POSITIVE: "Tích cực",
    NEUTRAL: "Trung lập",
    NEGATIVE: "Tiêu cực",
};

const feedbackRatingClasses: Record<FeedbackRating, string> = {
    POSITIVE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    NEUTRAL: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    NEGATIVE: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
};

const feedbackRatingIcons: Record<FeedbackRating, typeof Smile> = {
    POSITIVE: Smile,
    NEUTRAL: Meh,
    NEGATIVE: Frown,
};

const getReviewRoleLabel = (reviewAs?: string | null) => {
    if (reviewAs === "BUYER") return "Mua";
    if (reviewAs === "SELLER") return "Bán";
    return "--";
};

const Profile = () => {
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [feedbackList, setFeedbackList] = useState<FeedbackDto[]>([]);
    const [feedbackPage, setFeedbackPage] = useState(1);
    const [feedbackTotalPages, setFeedbackTotalPages] = useState(1);
    const [feedbackTotalElements, setFeedbackTotalElements] = useState(0);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            try {
                setIsLoadingProfile(true);
                setProfileError(null);
                const profileResponse = await userService.getMyProfile();

                if (isMounted) {
                    setProfile(profileResponse);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                if (isMounted) {
                    setProfileError(getErrorMessage(error, "Không tải được thông tin tài khoản."));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProfile(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        setFeedbackPage(1);
    }, [profile?.id]);

    useEffect(() => {
        const userId = profile?.id;

        if (!userId) {
            setFeedbackList([]);
            setFeedbackTotalPages(1);
            setFeedbackTotalElements(0);
            setFeedbackError(null);
            return;
        }

        let isMounted = true;

        const fetchFeedback = async () => {
            try {
                setIsLoadingFeedback(true);
                setFeedbackError(null);
                const response = await feedbackService.getPublicFeedback(userId, feedbackPage, 10);

                if (isMounted) {
                    setFeedbackList(response.data ?? []);
                    setFeedbackTotalPages(response.totalPages || 1);
                    setFeedbackTotalElements(response.totalElements || 0);
                }
            } catch (error) {
                console.error("Failed to load feedback:", error);
                if (isMounted) {
                    setFeedbackList([]);
                    setFeedbackTotalPages(1);
                    setFeedbackTotalElements(0);
                    setFeedbackError(getErrorMessage(error, "Không tải được danh sách đánh giá."));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingFeedback(false);
                }
            }
        };

        fetchFeedback();

        return () => {
            isMounted = false;
        };
    }, [profile?.id, feedbackPage]);

    const fullName = useMemo(() => {
        if (!profile) return "Người dùng";
        return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.username;
    }, [profile]);

    const roles = profile?.roles?.map((role) => role.name).filter(Boolean) ?? [];
    const reputationScore = profile?.reputationScore ?? 0;
    const strikeCount = profile?.strikeCount ?? 0;
    const buyerFeedbackCount = feedbackList.filter((feedback) => feedback.reviewAs === "BUYER").length;
    const sellerFeedbackCount = feedbackList.filter((feedback) => feedback.reviewAs === "SELLER").length;

    return (
        <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950">
            <div className="container mx-auto max-w-6xl space-y-6 px-4">
                <section className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                            <Avatar className="h-20 w-20 border bg-white shadow-sm">
                                <AvatarFallback className="bg-brand/10 text-2xl font-bold text-brand">
                                    {getInitials(fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Hồ sơ cá nhân</p>
                                    <h1 className="wrap-break-word text-2xl font-bold text-gray-950 dark:text-white sm:text-3xl">
                                        {fullName}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="gap-1">
                                        <UserRound className="h-3 w-3" />
                                        @{profile?.username ?? "--"}
                                    </Badge>
                                    {roles.length > 0 ? roles.map((role) => (
                                        <Badge key={role} variant="outline" className="gap-1">
                                            <ShieldCheck className="h-3 w-3" />
                                            {role}
                                        </Badge>
                                    )) : (
                                        <Badge variant="outline">Chưa có vai trò</Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-107.5">
                            <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                <p className="text-xs text-muted-foreground">Uy tín</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">{reputationScore}</p>
                            </div>
                            <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                <p className="text-xs text-muted-foreground">Cảnh cáo</p>
                                <p className="mt-1 text-2xl font-bold text-foreground">{strikeCount}</p>
                            </div>
                            <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                <p className="text-xs text-muted-foreground">Trạng thái</p>
                                <div className="mt-2">
                                    {profile?.isActive === false ? (
                                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                                            <XCircle className="h-3 w-3" />
                                            Bị khóa
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Hoạt động
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {isLoadingProfile && (
                    <Card>
                        <CardContent className="pt-6 text-sm text-muted-foreground">
                            Đang tải thông tin tài khoản...
                        </CardContent>
                    </Card>
                )}

                {profileError && !isLoadingProfile && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
                        <CardContent className="flex items-center gap-2 pt-6 text-sm text-red-700 dark:text-red-200">
                            <AlertTriangle className="h-4 w-4" />
                            {profileError}
                        </CardContent>
                    </Card>
                )}

                {!isLoadingProfile && !profileError && profile && (
                    <Tabs defaultValue="info" className="w-full">
                        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border bg-white p-1 dark:bg-gray-900 sm:w-fit">
                            <TabsTrigger value="info">Thông tin</TabsTrigger>
                            <TabsTrigger value="feedback">Đánh giá</TabsTrigger>
                            <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info" className="mt-4">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                                        <CardDescription>
                                            Thông tin định danh và liên hệ đang được lưu trên tài khoản của bạn.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="rounded-lg border bg-muted/40 p-4">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-muted-foreground">Tên hiển thị</p>
                                                    <p className="wrap-break-word text-xl font-semibold text-foreground">{fullName}</p>
                                                </div>
                                                <Badge variant="secondary" className="w-fit gap-1">
                                                    <UserRound className="h-3 w-3" />
                                                    @{profile.username}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <InfoItem
                                                icon={UserRound}
                                                label="Tên đăng nhập"
                                                value={profile.username}
                                            />
                                            <InfoItem
                                                icon={UserRound}
                                                label="Họ"
                                                value={profile.firstName}
                                            />
                                            <InfoItem
                                                icon={UserRound}
                                                label="Tên"
                                                value={profile.lastName}
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <InfoItem
                                                icon={Mail}
                                                label="Email"
                                                value={profile.email}
                                            />
                                            <InfoItem
                                                icon={Phone}
                                                label="Số điện thoại"
                                                value={profile.phoneNumber || "--"}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <InfoItem
                                                icon={CalendarDays}
                                                label="Ngày tạo tài khoản"
                                                value={formatDate(profile.createdAt)}
                                            />
                                            <InfoItem
                                                icon={KeyRound}
                                                label="Mật khẩu"
                                                value={profile.noPassword ? "Chưa tạo mật khẩu" : "Đã thiết lập"}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Vai trò & bảo mật</CardTitle>
                                        <CardDescription>
                                            Trạng thái tài khoản, vai trò và điểm uy tín hiện tại.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-foreground">Vai trò</p>
                                            <div className="flex flex-wrap gap-2">
                                                {roles.length > 0 ? roles.map((role) => (
                                                    <Badge key={role} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                )) : (
                                                    <span className="text-sm text-muted-foreground">--</span>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-3">
                                            <StatusRow label="Tài khoản" value={profile.isActive === false ? "Bị khóa" : "Hoạt động"} />
                                            <StatusRow label="Điểm uy tín" value={String(reputationScore)} />
                                            <StatusRow label="Số lần cảnh cáo" value={String(strikeCount)} />
                                            <StatusRow label="Mật khẩu" value={profile.noPassword ? "Chưa tạo" : "Đã có"} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="feedback" className="mt-4">
                            <Card>
                                <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Feedback đã nhận</CardTitle>
                                        <CardDescription>
                                            Các đánh giá công khai bạn nhận được khi giao dịch với vai trò người mua hoặc người bán.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="w-fit gap-1">
                                        <MessageSquareText className="h-3.5 w-3.5" />
                                        {feedbackTotalElements} feedback
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="h-4 w-4" />
                                                Điểm uy tín
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{reputationScore}</p>
                                        </div>
                                        <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <UserRound className="h-4 w-4" />
                                                Vai trò mua
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{buyerFeedbackCount}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Trong trang hiện tại</p>
                                        </div>
                                        <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
                                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <ShieldCheck className="h-4 w-4" />
                                                Vai trò bán
                                            </div>
                                            <p className="text-2xl font-bold text-foreground">{sellerFeedbackCount}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Trong trang hiện tại</p>
                                        </div>
                                    </div>

                                    {isLoadingFeedback ? (
                                        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                            Đang tải feedback...
                                        </div>
                                    ) : feedbackError ? (
                                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                                            <AlertTriangle className="h-4 w-4" />
                                            {feedbackError}
                                        </div>
                                    ) : feedbackList.length > 0 ? (
                                        <div className="space-y-3">
                                            {feedbackList.map((feedback) => (
                                                <FeedbackCard key={feedback.id} feedback={feedback} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-dashed p-8 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                <MessageSquareText className="h-6 w-6" />
                                            </div>
                                            <p className="font-semibold text-foreground">Chưa có feedback nào</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Feedback sẽ xuất hiện sau khi giao dịch hoàn tất và đối tác gửi đánh giá.
                                            </p>
                                        </div>
                                    )}

                                    <SimplePagination
                                        page={feedbackPage}
                                        totalPages={feedbackTotalPages}
                                        onPageChange={setFeedbackPage}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="addresses" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Địa chỉ nhận hàng</CardTitle>
                                    <CardDescription>
                                        Quản lý địa chỉ dùng cho thanh toán và giao hàng.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProfileAddressSection />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

interface InfoItemProps {
    icon: typeof UserRound;
    label: string;
    value: string;
}

interface FeedbackCardProps {
    feedback: FeedbackDto;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
    const RatingIcon = feedbackRatingIcons[feedback.rating];
    const reviewRoleLabel = getReviewRoleLabel(feedback.reviewAs);

    return (
        <div className="rounded-md border bg-white p-4 shadow-sm dark:bg-gray-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="wrap-break-word text-sm font-semibold text-foreground">
                            Từ @{feedback.fromUsername}
                        </p>
                        <Badge variant="outline" className="w-fit">
                            {reviewRoleLabel}
                        </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Gửi cho @{feedback.toUsername} · {formatDate(feedback.createdAt)}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`w-fit gap-1 ${feedbackRatingClasses[feedback.rating]}`}>
                        <RatingIcon className="h-3.5 w-3.5" />
                        {feedbackRatingLabels[feedback.rating]}
                    </Badge>
                    {feedback.invoiceId && (
                        <Link
                            to={`/my-invoices/${feedback.invoiceId}`}
                            className="inline-flex h-8 items-center gap-1 rounded-md border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <Receipt className="h-3.5 w-3.5" />
                            Xem đơn hàng
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-4 rounded-md bg-slate-50 p-3 dark:bg-gray-950">
                <p className="whitespace-pre-line wrap-break-word text-sm leading-6 text-muted-foreground">
                    {feedback.comment || "Người đánh giá không để lại nhận xét."}
                </p>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
    return (
        <div className="rounded-md border bg-slate-50 p-4 dark:bg-gray-950">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <p className="wrap-break-word text-sm font-semibold text-foreground">{value || "--"}</p>
        </div>
    );
}

interface StatusRowProps {
    label: string;
    value: string;
}

function StatusRow({ label, value }: StatusRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium text-foreground">{value}</span>
        </div>
    );
}

export default Profile;
