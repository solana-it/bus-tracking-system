import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Bus, Facebook, Twitter, MessageCircle, Globe } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Bus className="mr-2 h-5 w-5" />
              {t("app.name")}
            </h3>
            <p className="text-gray-400 text-sm">{t("app.tagline")}</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  {t("passenger.findBus")}
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="text-gray-300 hover:text-white">
                  {t("nav.myBookings")}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  {t("nav.track")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  {t("footer.contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  {t("footer.termsOfService")}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  {t("footer.privacyPolicy")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">{t("footer.connectWithUs")}</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <MessageCircle size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Globe size={20} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">Email: info@slbus.lk</p>
            <p className="text-gray-400 text-sm">Phone: +94 11 2345678</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-400 text-center">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
