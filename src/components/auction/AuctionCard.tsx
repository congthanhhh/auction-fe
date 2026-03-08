import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '../ui/separator';
// use skeleton for loading state

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
}: AuctionCardProps) {
    return (
        <Card className="overflow-hidden shadow-xs hover:shadow-md transition-all p-0 group rounded-none border-white dark:border-gray-700 gap-2">
            <Link to={`/auction/${id}`} className="block relative">
                <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>
            <CardContent className="p-2 pt-0">
                <div className='flex justify-between items-start gap-1'>
                    <Link to={`/auction/${id}`} className="hover:text-brand hover:underline">
                        <h3 className="text-sm font-normal line-clamp-2 min-h-10">
                            {title}
                        </h3>
                    </Link>
                    <div>
                        <Heart size={20} fill='red' color='red' />
                    </div>
                </div>
                <div className="py-1">
                    <p className="font-bold text-gray-900 dark:text-white">
                        {currentBid.toFixed(2)}đ
                    </p>
                </div>
                <div className="flex items-center h-5 text-sm text-gray-600 dark:text-gray-400 gap-2">
                    <span>Bids: {bids}</span>
                    <Separator orientation="vertical" />
                    <span className="flex items-center">
                        <Clock className="h-3 w-3" />
                        {timeRemaining}
                    </span>
                    <Separator orientation="vertical" />
                    <Button className='text-brand hover:text-brand-hover px-0'
                        size="sm" variant="ghost"
                    >
                        Quick bid
                    </Button>
                    <Separator orientation="vertical" />
                    <Button className='text-brand hover:text-brand-hover px-0'
                        size="sm" variant="ghost"
                    >
                        Buy it now
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
