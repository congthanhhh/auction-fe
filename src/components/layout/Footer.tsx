import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t('footer.aboutTitle')}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {t('footer.aboutDescription')}
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
                        <h3 className="font-bold text-lg mb-4">{t('footer.customerService')}</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/help" className="hover:text-white">{t('footer.helpCenter')}</Link></li>
                            <li><Link to="/contact" className="hover:text-white">{t('footer.contactSupport')}</Link></li>
                            <li><Link to="/shipping" className="hover:text-white">{t('footer.shippingInfo')}</Link></li>
                            <li><Link to="/returns" className="hover:text-white">{t('footer.returnsRefunds')}</Link></li>
                            <li><Link to="/faq" className="hover:text-white">{t('footer.faq')}</Link></li>
                        </ul>
                    </div>

                    {/* Buyer Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t('footer.buyerResources')}</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/how-to-bid" className="hover:text-white">{t('footer.howToBid')}</Link></li>
                            <li><Link to="/buying-guide" className="hover:text-white">{t('footer.buyingGuide')}</Link></li>
                            <li><Link to="/payment-methods" className="hover:text-white">{t('footer.paymentMethods')}</Link></li>
                            <li><Link to="/my-account" className="hover:text-white">{t('footer.myAccount')}</Link></li>
                            <li><Link to="/watchlist" className="hover:text-white">{t('footer.myWatchlist')}</Link></li>
                        </ul>
                    </div>

                    {/* Seller Resources */}
                    <div>
                        <h3 className="font-bold text-lg mb-4">{t('footer.sellerResources')}</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/start-selling" className="hover:text-white">{t('footer.startSelling')}</Link></li>
                            <li><Link to="/seller-guide" className="hover:text-white">{t('footer.sellerGuide')}</Link></li>
                            <li><Link to="/fees" className="hover:text-white">{t('footer.feesPricing')}</Link></li>
                            <li><Link to="/seller-dashboard" className="hover:text-white">{t('footer.sellerDashboard')}</Link></li>
                            <li><Link to="/seller-policy" className="hover:text-white">{t('footer.sellerPolicy')}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                        <p>{t('footer.copyright')}</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
                            <Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link>
                            <Link to="/accessibility" className="hover:text-white">{t('footer.accessibility')}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
