import type { InvoiceResponse } from "@/types/invoice";
import { PackageSearch } from "lucide-react";

interface InvoiceImageProps {
    invoice: InvoiceResponse;
}

export function InvoiceImage({ invoice }: InvoiceImageProps) {
    const firstImage = invoice.product.images[0]?.url;

    return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            {firstImage ? (
                <img
                    src={firstImage}
                    alt={invoice.product.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <PackageSearch className="m-auto mt-4 size-5 text-muted-foreground" />
            )}
        </div>
    );
}
