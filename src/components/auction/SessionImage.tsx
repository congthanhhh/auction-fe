import type { AuctionSessionResponse } from "@/types/auction";
import { PackageSearch } from "lucide-react";

interface SessionImageProps {
    session: AuctionSessionResponse;
}

export function SessionImage({ session }: SessionImageProps) {
    const firstImage = session.product.images[0]?.url;

    return (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
            {firstImage ? (
                <img src={firstImage} alt={session.product.name} className="h-full w-full object-cover" />
            ) : (
                <PackageSearch className="m-auto mt-4 size-5 text-muted-foreground" />
            )}
        </div>
    );
}
