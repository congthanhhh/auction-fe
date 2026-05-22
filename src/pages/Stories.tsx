import { Link } from "react-router-dom";
import {
    BadgeDollarSign,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    Gavel,
    Handshake,
    HelpCircle,
    MapPin,
    PackageCheck,
    PackageSearch,
    ShieldCheck,
    Sparkles,
    Truck,
    UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const proxySteps = [
    {
        title: "Bạn nhập giá tối đa",
        description:
            "Đây là mức cao nhất bạn sẵn sàng trả cho sản phẩm. Người khác không thấy con số này.",
    },
    {
        title: "Hệ thống tự tăng giá hộ bạn",
        description:
            "Khi có người đặt giá, website chỉ tăng vừa đủ để bạn tiếp tục dẫn trước, không nhảy thẳng lên giá tối đa.",
    },
    {
        title: "Dừng khi vượt quá giới hạn",
        description:
            "Nếu đối thủ đặt cao hơn giá tối đa của bạn, bạn sẽ không còn dẫn đầu và có thể cân nhắc đặt lại.",
    },
];

const bidIncrementTiers = [
    { range: "Đến 50.000 ₫", increment: "5.000 ₫" },
    { range: "Trên 50.000 ₫ đến 200.000 ₫", increment: "10.000 ₫" },
    { range: "Trên 200.000 ₫ đến 500.000 ₫", increment: "20.000 ₫" },
    { range: "Trên 500.000 ₫ đến 1.000.000 ₫", increment: "50.000 ₫" },
    { range: "Trên 1.000.000 ₫ đến 5.000.000 ₫", increment: "100.000 ₫" },
    { range: "Trên 5.000.000 ₫ đến 10.000.000 ₫", increment: "200.000 ₫" },
    { range: "Trên 10.000.000 ₫ đến 50.000.000 ₫", increment: "500.000 ₫" },
];

const auctionSteps = [
    {
        icon: ShieldCheck,
        title: "Đăng nhập tài khoản",
        description: "Đăng nhập để đặt giá, theo dõi phiên đã tham gia và nhận thông báo khi trạng thái thay đổi.",
    },
    {
        icon: Gavel,
        title: "Chọn phiên đấu giá",
        description: "Mở sản phẩm bạn quan tâm, đọc kỹ ảnh, mô tả, giá hiện tại, thời gian kết thúc và thông tin người bán.",
    },
    {
        icon: BadgeDollarSign,
        title: "Đặt giá tối đa",
        description: "Nhập mức giá bạn thật sự chấp nhận trả. Proxy bidding sẽ tự cạnh tranh trong giới hạn đó.",
    },
    {
        icon: Clock,
        title: "Theo dõi phiên",
        description: "Vào My Joined Auctions để xem bạn đang dẫn đầu, đã bị vượt giá hay phiên đã chuyển trạng thái.",
    },
    {
        icon: UserCheck,
        title: "Xác định người thắng",
        description: "Khi phiên kết thúc, hệ thống tự xác định người đấu giá cao nhất là người thắng cuộc.",
    },
    {
        icon: BadgeDollarSign,
        title: "Thanh toán và mở đơn hàng",
        description: "Người thắng vào hóa đơn, chọn địa chỉ nhận hàng và thanh toán qua VNPay. Khi thanh toán thành công, đơn chuyển sang PAID để người bán gửi hàng.",
    },
];

const approvalNotes = [
    "Sau khi người bán gửi thông tin, bài đấu giá sẽ ở trạng thái chờ duyệt.",
    "Admin kiểm tra và duyệt bài, thường trong vòng 24 giờ.",
    "Chỉ khi bài được duyệt, phiên mới hiển thị công khai trên hệ thống.",
    "Người dùng khác chỉ có thể tham gia khi bài đấu giá đã được duyệt.",
];

const sellerResponsibilities = [
    "Cung cấp thông tin sản phẩm chính xác và đầy đủ: ảnh, mô tả, giá khởi điểm, bước giá.",
    "Thông tin sai lệch có thể gây nhầm lẫn, tranh chấp và ảnh hưởng uy tín người bán.",
    "Nếu phát hiện thông tin sai, admin có quyền từ chối hoặc xóa bài đấu giá.",
    "Người bán chịu trách nhiệm về mọi thông tin đã đăng tải.",
];

const shippingSteps = [
    {
        icon: BadgeDollarSign,
        title: "Người mua thanh toán",
        description: "Sau khi thắng đấu giá, người mua thanh toán hóa đơn qua VNPay. Đơn hàng ở trạng thái PAID khi hệ thống ghi nhận thanh toán thành công.",
    },
    {
        icon: Truck,
        title: "Người bán xác nhận gửi hàng",
        description: "Khi đơn đã PAID, người bán đóng gói, gửi qua đơn vị vận chuyển và nhập mã vận đơn như VN123456 trong chi tiết đơn hàng.",
    },
    {
        icon: PackageSearch,
        title: "Người mua theo dõi vận đơn",
        description: "Khi đơn chuyển sang SHIPPING, người mua xem mã vận đơn trên website và tra cứu hành trình tại trang của đơn vị vận chuyển.",
    },
    {
        icon: PackageCheck,
        title: "Người mua xác nhận đã nhận hàng",
        description: "Sau khi nhận và kiểm tra sản phẩm, người mua bấm Đã nhận được hàng. Đơn chuyển sang COMPLETED và có thể mở đánh giá.",
    },
    {
        icon: HelpCircle,
        title: "Khiếu nại trước khi tự hoàn thành",
        description: "Nếu chưa nhận được hàng hoặc vận chuyển có vấn đề, người mua bấm Khiếu nại / Báo mất khi đơn còn SHIPPING để chuyển đơn sang DISPUTE.",
    },
    {
        icon: Clock,
        title: "Tự động hoàn thành",
        description: "Nếu hết thời gian chờ mà không có khiếu nại, hệ thống có thể tự hoàn thành đơn để tránh đơn bị treo. Đơn DISPUTE sẽ không tự hoàn thành.",
    },
];

const orderDetailItems = [
    "Thông tin người nhận: tên, số điện thoại, email và địa chỉ giao hàng.",
    "Giá đấu thắng, thời hạn thanh toán và thời điểm thanh toán nếu có.",
    "Trạng thái đơn hàng: PENDING, PAID, SHIPPING, COMPLETED, DISPUTE hoặc trạng thái hủy/hoàn tiền.",
    "Đơn vị vận chuyển, mã vận đơn và thời điểm người bán xác nhận đã gửi hàng.",
    "Các thao tác phù hợp với vai trò: thanh toán, xác nhận gửi hàng, xác nhận đã nhận hàng hoặc khiếu nại.",
];

const platformRoles = [
    "Hệ thống ghi nhận thanh toán VNPay và cập nhật trạng thái hóa đơn theo từng bước.",
    "Hệ thống lưu mã vận đơn để người mua có thể theo dõi quá trình giao hàng.",
    "Hệ thống không giao hàng, không quản lý logistics và không bảo đảm quá trình vận chuyển.",
    "Khi có DISPUTE, hệ thống dừng tự động hoàn thành và chuyển đơn sang trạng thái cần kiểm tra thủ công.",
    "Admin hoặc người bán cần kiểm tra thêm với đơn vị vận chuyển khi phát sinh khiếu nại.",
];

const orderStatusFlow = [
    {
        status: "PENDING",
        label: "Chờ thanh toán",
        description: "Đơn vừa được tạo sau khi thắng đấu giá hoặc mua ngay, người mua cần chọn địa chỉ và thanh toán.",
    },
    {
        status: "PAID",
        label: "Đã thanh toán",
        description: "VNPay đã ghi nhận thanh toán, người bán bắt đầu đóng gói và gửi hàng.",
    },
    {
        status: "SHIPPING",
        label: "Đang giao hàng",
        description: "Người bán đã nhập mã vận đơn, người mua theo dõi và chờ nhận hàng.",
    },
    {
        status: "COMPLETED",
        label: "Hoàn thành",
        description: "Người mua xác nhận đã nhận hàng hoặc hệ thống tự hoàn thành sau thời gian chờ.",
    },
    {
        status: "DISPUTE",
        label: "Khiếu nại",
        description: "Người mua báo chưa nhận hàng hoặc có vấn đề, đơn được dừng tự hoàn thành để kiểm tra.",
    },
    {
        status: "CANCELLED_NON_PAYMENT",
        label: "Hủy do không thanh toán",
        description: "Người thắng không thanh toán đúng hạn, người bán có thể báo cáo bùng kèo.",
    },
    {
        status: "CANCELLED_BY_SELLER",
        label: "Người bán hủy",
        description: "Đơn bị hủy từ phía người bán theo quy trình xử lý của hệ thống.",
    },
    {
        status: "REFUNDED",
        label: "Đã hoàn tiền",
        description: "Đơn đã được ghi nhận hoàn tiền sau quá trình xử lý liên quan.",
    },
];

const quickTips = [
    "Đặt giá tối đa theo ngân sách thật, không theo cảm xúc ở phút cuối.",
    "Kiểm tra kỹ ảnh, mô tả, giá mua ngay và thời gian kết thúc trước khi bid.",
    "Người bán nên lưu lại hình ảnh đóng gói, biên nhận gửi hàng và mã vận đơn.",
    "Người mua nên chọn đúng địa chỉ nhận hàng, theo dõi vận đơn và khiếu nại sớm nếu gần hết thời gian chờ.",
];

export default function Stories() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
            <section className="border-b bg-white dark:bg-gray-900">
                <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                    <div className="space-y-5">
                        <Badge variant="secondary" className="w-fit">
                            Hướng dẫn cho người mới
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="max-w-3xl text-3xl font-bold tracking-normal text-gray-950 dark:text-white sm:text-4xl">
                                Hiểu proxy bidding, đấu giá, giao và nhận hàng trên AuctionShop
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                                Trang này giúp bạn nắm cách hệ thống tự đặt giá, cách tham gia một phiên đấu giá,
                                quy trình duyệt bài, và những việc cần làm sau khi phiên kết thúc.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild className="bg-brand hover:bg-brand-hover">
                                <Link to="/view-all-featured">Xem phiên nổi bật</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/my-joined">Theo dõi phiên đã tham gia</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-slate-900 p-5 text-white shadow-sm dark:bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-md bg-brand text-white">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-white/70">Ví dụ nhanh</p>
                                <p className="font-semibold">Proxy bidding hoạt động như thế nào?</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="rounded-md bg-white/10 p-3">
                                Giá hiện tại: <span className="font-semibold">1.000.000 ₫</span>
                            </div>
                            <div className="rounded-md bg-white/10 p-3">
                                Bạn nhập giá tối đa: <span className="font-semibold">1.500.000 ₫</span>
                            </div>
                            <div className="rounded-md bg-emerald-500/20 p-3 text-emerald-100">
                                Hệ thống chỉ đặt vừa đủ để bạn dẫn trước, ví dụ 1.050.000 ₫ hoặc 1.100.000 ₫ tùy bước giá.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-10">
                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="space-y-4">
                        <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="size-5 text-brand" />
                                <h2 className="font-semibold text-foreground">Proxy bidding là gì?</h2>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Proxy bidding là cơ chế đặt giá tự động. Bạn nhập mức giá tối đa, sau đó hệ thống
                                thay bạn cạnh tranh từng bước nhỏ cho đến khi bạn thắng hoặc bị vượt giá.
                            </p>
                        </div>
                        <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                            <h2 className="font-semibold text-foreground">Website giữ vai trò gì?</h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                AuctionShop hỗ trợ đăng bài, duyệt bài, ghi nhận thanh toán VNPay, lưu mã vận đơn và cập nhật
                                trạng thái đơn hàng. Việc giao hàng thực tế vẫn do người bán làm việc với đơn vị vận chuyển.
                            </p>
                        </div>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/30">
                            <h2 className="font-semibold text-amber-900 dark:text-amber-100">Lưu ý quan trọng</h2>
                            <p className="mt-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
                                Sau khi người bán nhập mã vận đơn, người mua nên theo dõi đơn thường xuyên. Nếu gần hết thời gian chờ
                                mà vẫn chưa nhận được hàng, hãy tạo khiếu nại khi đơn còn ở trạng thái SHIPPING.
                            </p>
                        </div>
                    </aside>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Cách proxy bidding hoạt động</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Hãy xem proxy bidding như một trợ lý đặt giá thầm lặng.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {proxySteps.map((step, index) => (
                                    <div key={step.title} className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                        <div className="flex size-9 items-center justify-center rounded-md bg-brand/10 text-brand">
                                            {index + 1}
                                        </div>
                                        <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Bước giá hiện tại</h3>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            Ở phiên bản hiện tại, bước giá đang được cấu hình cố định theo mốc giá hiện tại.
                                            Khi proxy bidding cần tăng giá, hệ thống sẽ chọn bước giá tương ứng trong bảng dưới đây.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="w-fit border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                                        Sẽ cho seller tự chỉnh sau
                                    </Badge>
                                </div>

                                <div className="mt-4 overflow-hidden rounded-lg border">
                                    <div className="grid grid-cols-[1fr_140px] bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                                        <div className="px-4 py-3">Giá hiện tại của phiên</div>
                                        <div className="border-l px-4 py-3 text-right">Bước giá</div>
                                    </div>
                                    {bidIncrementTiers.map((tier) => (
                                        <div
                                            key={tier.range}
                                            className="grid grid-cols-[1fr_140px] border-t bg-white text-sm dark:bg-gray-900"
                                        >
                                            <div className="px-4 py-3 text-muted-foreground">{tier.range}</div>
                                            <div className="border-l px-4 py-3 text-right font-semibold text-foreground">
                                                {tier.increment}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    Ví dụ: nếu giá hiện tại là 1.200.000 ₫, bước giá đang áp dụng là 100.000 ₫.
                                    Sau này, khi chức năng cấu hình bước giá được cập nhật, người bán có thể tự đặt bước giá phù hợp cho phiên đấu giá của mình.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Quy trình đấu giá trên website</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Từ lúc chọn sản phẩm đến khi hoàn tất giao dịch, bạn có thể đi theo các bước này.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {auctionSteps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.title} className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                            <div className="flex gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-slate-200">
                                                    <Icon className="size-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <ClipboardCheck className="size-5 text-brand" />
                                    <h2 className="text-xl font-bold text-gray-950 dark:text-white">Quy trình duyệt bài</h2>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {approvalNotes.map((note) => (
                                        <div key={note} className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                            <p className="text-sm leading-6 text-muted-foreground">{note}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <PackageSearch className="size-5 text-brand" />
                                    <h2 className="text-xl font-bold text-gray-950 dark:text-white">Trách nhiệm người bán</h2>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {sellerResponsibilities.map((item) => (
                                        <div key={item} className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Vận chuyển, giao và nhận hàng</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Sau khi đấu giá kết thúc, người thắng thanh toán hóa đơn. Từ đó đơn hàng đi qua các bước thanh toán,
                                    gửi hàng, nhận hàng, tự hoàn thành hoặc khiếu nại.
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {shippingSteps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.title} className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                            <div className="flex gap-4">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                                                    <Icon className="size-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <Clock className="size-5 text-brand" />
                                <h2 className="text-xl font-bold text-gray-950 dark:text-white">Luồng trạng thái đơn hàng</h2>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {orderStatusFlow.map((item) => (
                                    <div key={item.status} className="rounded-md border bg-slate-50 p-3 dark:bg-gray-950">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="border-brand/30 bg-white font-mono text-[11px] text-brand dark:bg-gray-900">
                                                {item.status}
                                            </Badge>
                                            <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <MapPin className="size-5 text-brand" />
                                    <h2 className="text-xl font-bold text-gray-950 dark:text-white">Trong chi tiết đơn hàng</h2>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {orderDetailItems.map((item) => (
                                        <div key={item} className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                            <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900 dark:bg-red-950/25">
                                <div className="flex items-center gap-3">
                                    <Handshake className="size-5 text-red-700 dark:text-red-200" />
                                    <h2 className="text-xl font-bold text-red-950 dark:text-red-100">Vai trò của hệ thống</h2>
                                </div>
                                <div className="mt-4 space-y-3">
                                    {platformRoles.map((item) => (
                                        <div key={item} className="flex gap-3">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-700 dark:text-red-200" />
                                            <p className="text-sm leading-6 text-red-900 dark:text-red-100">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-5 shadow-sm dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <PackageCheck className="size-5 text-emerald-600" />
                                <h2 className="text-xl font-bold text-gray-950 dark:text-white">Lưu ý để đấu giá an toàn</h2>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {quickTips.map((tip) => (
                                    <div key={tip} className="flex gap-3 rounded-md bg-slate-50 p-3 dark:bg-gray-950">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                        <p className="text-sm leading-6 text-muted-foreground">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
