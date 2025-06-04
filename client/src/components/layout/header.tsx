import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bus, Globe, User, ChevronDown, LogOut } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { language, setLanguage, t, languageNames } = useLanguage();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Bus className="mr-2 h-6 w-6" />
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">{t("app.name")}</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white">
                <Globe className="mr-1 h-4 w-4" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("app.name")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                {languageNames.en}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("si")}>
                {languageNames.si}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ta")}>
                {languageNames.ta}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white">
                  <User className="mr-1 h-4 w-4" />
                  <span className="hidden md:inline">{user.name}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-gray-500">
                  {user.role === "bus_owner" ? t("auth.role.bus_owner") : t("auth.role.passenger")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="w-full cursor-pointer">
                    {t("nav.home")}
                  </Link>
                </DropdownMenuItem>
                {user.role === "passenger" && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="w-full cursor-pointer">
                      {t("nav.myBookings")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            location !== "/auth" && (
              <Button asChild variant="secondary" size="sm">
                <Link href="/auth">{t("auth.login")}</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
