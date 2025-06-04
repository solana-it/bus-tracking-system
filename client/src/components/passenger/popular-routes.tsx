import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PopularRoutes() {
  const { t } = useLanguage();
  
  // Fetch all routes
  const { data: routes, isLoading } = useQuery({
    queryKey: ["/api/routes"],
  });
  
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}-${hours + 1} ${t("hours")}`;
  };
  
  // Get some popular routes for display
  // In a real app, this would be based on booking data or API
  const popularRoutes = routes?.slice(0, 4) || [];
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">{t("passenger.popularRoutes")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {popularRoutes.map((route: any) => (
          <div key={route.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-gray-900">
                  {route.fromLocation} - {route.toLocation}
                </div>
                <div className="text-sm text-primary">From Rs. {Math.floor(route.estimatedDuration * 5)}</div>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{formatDuration(route.estimatedDuration)}</span>
              </div>
              <div className="text-xs text-gray-500">{t("passenger.dailyDepartures")}: {Math.floor(Math.random() * 20) + 10}+</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
