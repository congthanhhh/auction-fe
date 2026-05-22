import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AuctionSessionResponse } from "@/types/auction";
import { auctionService } from "@/services/auctionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Save } from "lucide-react";
import { getDateTimeInputValue } from "@/components/auction/session-list-utils";

interface EditSessionDialogProps {
    session: AuctionSessionResponse;
    disabled: boolean;
    onUpdated?: () => Promise<void> | void;
}

export function EditSessionDialog({ session, disabled, onUpdated }: EditSessionDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const startTime = String(formData.get("startTime") ?? "");
        const endTime = String(formData.get("endTime") ?? "");
        const startPriceValue = String(formData.get("startPrice") ?? "");
        const reservePriceValue = String(formData.get("reservePrice") ?? "");
        const buyNowPriceValue = String(formData.get("buyNowPrice") ?? "");

        const parsedStartPrice = startPriceValue.trim() ? Number(startPriceValue) : null;
        const parsedReservePrice = reservePriceValue.trim() ? Number(reservePriceValue) : null;
        const parsedBuyNowPrice = buyNowPriceValue.trim() ? Number(buyNowPriceValue) : null;

        if (
            (parsedStartPrice != null && (!Number.isFinite(parsedStartPrice) || parsedStartPrice <= 0)) ||
            (parsedReservePrice != null && (!Number.isFinite(parsedReservePrice) || parsedReservePrice <= 0)) ||
            (parsedBuyNowPrice != null && (!Number.isFinite(parsedBuyNowPrice) || parsedBuyNowPrice <= 0))
        ) {
            setError(t("auction.sessions.invalidPrices"));
            return;
        }

        if (
            startTime &&
            endTime &&
            (!Number.isFinite(new Date(startTime).getTime()) ||
                !Number.isFinite(new Date(endTime).getTime()) ||
                new Date(endTime) <= new Date(startTime))
        ) {
            setError(t("auction.sessions.invalidTime"));
            return;
        }

        try {
            setIsSaving(true);
            await auctionService.updateSession(session.id, {
                startTime: startTime.trim() ? startTime : null,
                endTime: endTime.trim() ? endTime : null,
                startPrice: parsedStartPrice,
                reservePrice: parsedReservePrice,
                buyNowPrice: parsedBuyNowPrice,
            });
            await onUpdated?.();
            setOpen(false);
        } catch (err) {
            const message =
                err && typeof err === "object" && "message" in err
                    ? String((err as Error).message)
                    : t("auction.sessions.saveError");
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled}>
                    <Pencil className="size-4" />
                    {t("auction.sessions.edit")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{t("auction.sessions.editTitle")}</DialogTitle>
                        <DialogDescription>{t("auction.sessions.editDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("auction.sessions.product")}</Label>
                            <p className="text-sm font-medium text-foreground">{session.product.name}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor={`startTime-${session.id}`}>{t("auction.sessions.startTime")}</Label>
                                <Input
                                    id={`startTime-${session.id}`}
                                    name="startTime"
                                    type="datetime-local"
                                    defaultValue={getDateTimeInputValue(session.startTime)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`endTime-${session.id}`}>{t("auction.sessions.endTime")}</Label>
                                <Input
                                    id={`endTime-${session.id}`}
                                    name="endTime"
                                    type="datetime-local"
                                    defaultValue={getDateTimeInputValue(session.endTime)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor={`startPrice-${session.id}`}>{t("auction.sessions.startPrice")}</Label>
                                <Input id={`startPrice-${session.id}`} name="startPrice" type="number" min={1} defaultValue={session.startPrice} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`reservePrice-${session.id}`}>{t("auction.sessions.reservePrice")}</Label>
                                <Input id={`reservePrice-${session.id}`} name="reservePrice" type="number" min={1} placeholder={t("common.optional")} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`buyNowPrice-${session.id}`}>{t("auction.sessions.buyNowPrice")}</Label>
                                <Input id={`buyNowPrice-${session.id}`} name="buyNowPrice" type="number" min={1} defaultValue={session.buyNowPrice ?? ""} />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">{t("common.cancel")}</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
