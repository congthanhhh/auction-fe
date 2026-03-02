import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">About AuctionSite</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Your trusted online auction marketplace. Find unique items and bid on your favorites.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-800 p-2 rounded hover:bg-gray-700">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                            <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                            <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
                            <li><Link to="/returns" className="hover:text-white">Returns & Refunds</Link></li>
                            <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Buyer Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Buyer Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/how-to-bid" className="hover:text-white">How to Bid</Link></li>
                            <li><Link to="/buying-guide" className="hover:text-white">Buying Guide</Link></li>
                            <li><Link to="/payment-methods" className="hover:text-white">Payment Methods</Link></li>
                            <li><Link to="/my-account" className="hover:text-white">My Account</Link></li>
                            <li><Link to="/watchlist" className="hover:text-white">My Watchlist</Link></li>
                        </ul>
                    </div>

                    {/* Seller Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">Seller Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/start-selling" className="hover:text-white">Start Selling</Link></li>
                            <li><Link to="/seller-guide" className="hover:text-white">Seller Guide</Link></li>
                            <li><Link to="/fees" className="hover:text-white">Fees & Pricing</Link></li>
                            <li><Link to="/seller-dashboard" className="hover:text-white">Seller Dashboard</Link></li>
                            <li><Link to="/seller-policy" className="hover:text-white">Seller Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>&copy; 2026 AuctionSite. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white">Terms of Use</Link>
                            <Link to="/accessibility" className="hover:text-white">Accessibility</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
