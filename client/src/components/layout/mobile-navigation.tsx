import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Search, Ticket, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Don't show mobile navigation on auth page or for users who aren't logged in
  if (location === "/auth" || !user) {
    return null;
  }

  const navItems = [
    {
      icon: <Search className="h-5 w-5" />,
      label: t("nav.search"),
      href: "/",
      active: location === "/"
    },
    {
      icon: <Ticket className="h-5 w-5" />,
      label: t("nav.myBookings"),
      href: "/my-bookings",
      active: location === "/my-bookings",
      role: "passenger" // Only show for passengers
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: t("nav.track"),
      href: "/track",
      active: location.startsWith("/track")
    },
    {
      icon: <User className="h-5 w-5" />,
      label: t("nav.profile"),
      href: "/profile",
      active: location === "/profile"
    }
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.role || item.role === user.role
  );
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-10">
      <div className="flex justify-around py-2">
        {filteredNavItems.map((item, index) => (
          <Link 
            key={index} 
            href={item.href}
            className={cn(
              "flex flex-col items-center px-3 py-1",
              item.active ? "text-primary" : "text-gray-500"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
