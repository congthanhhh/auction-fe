import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AuctionCardProps {
    id: number;
    title: string;
    image: string;
    currentBid: number;
    bids: number;
    timeRemaining: string;
    isBuyNow?: boolean;
    buyNowPrice?: number;
}

export default function AuctionCard({
    id,
    title,
    image,
    currentBid,
    bids,
    timeRemaining,
    isBuyNow,
    buyNowPrice
}: AuctionCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
            <Link to={`/auction/${id}`} className="block relative">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full shadow-md"
                    onClick={(e) => {
                        e.preventDefault();
                        // Handle favorite toggle
                    }}
                >
                    <Heart className="h-4 w-4" />
                </Button>
                {isBuyNow && (
                    <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700">
                        Buy It Now
                    </Badge>
                )}
            </Link>

            <CardContent className="p-4 pb-0">
                <Link to={`/auction/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-10 mb-3">
                        {title}
                    </h3>
                </Link>

                <div className="space-y-2">
                    {isBuyNow ? (
                        <div>
                            <p className="text-xs text-muted-foreground">Buy It Now</p>
                            <p className="text-xl font-bold text-green-600 dark:text-green-500">
                                ${buyNowPrice?.toFixed(2)}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-muted-foreground">Current Bid</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                ${currentBid.toFixed(2)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <Badge variant="outline">{bids} Bids</Badge>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeRemaining}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-3">
                {isBuyNow ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                        Buy It Now
                    </Button>
                ) : (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                        Quick Bid
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
