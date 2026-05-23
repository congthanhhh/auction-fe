import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AdminConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isSubmitting?: boolean;
    destructive?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function AdminConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    isSubmitting = false,
    destructive = false,
    onOpenChange,
    onConfirm,
}: AdminConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant={destructive ? "destructive" : "default"}
                        disabled={isSubmitting}
                        onClick={onConfirm}
                    >
                        {isSubmitting ? "Working..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
