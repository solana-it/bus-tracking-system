import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import SearchForm from "@/components/passenger/search-form";
import BusCard from "@/components/passenger/bus-card";
import SeatSelection from "@/components/passenger/seat-selection";
import BusTracking from "@/components/passenger/bus-tracking";
import PopularRoutes from "@/components/passenger/popular-routes";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function PassengerPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchParams, setSearchParams] = useState<any>(null);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showBusTracking, setShowBusTracking] = useState(false);
  
  // Search schedules when form is submitted
  const { data: searchResults, isLoading } = useQuery({
    queryKey: [searchParams ? `/api/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}` : null],
    enabled: !!searchParams,
  });
  
  // Handle search form submission
  const handleSearch = (data: any) => {
    setSearchParams(data);
    setSelectedBus(null);
    setSelectedSchedule(null);
    setSelectedRoute(null);
    setShowSeatSelection(false);
    setShowBusTracking(false);
  };
  
  // Handle bus selection for booking
  const handleSelectBus = (bus: any, schedule: any, route: any) => {
    setSelectedBus(bus);
    setSelectedSchedule(schedule);
    setSelectedRoute(route);
    setShowSeatSelection(true);
    setShowBusTracking(false);
    
    // Scroll to seat selection
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById("seatSelectionSection")?.offsetTop || 0 - 100,
        behavior: "smooth",
      });
    }, 100);
  };
  
  // Handle booking success
  const handleBookingSuccess = (bookingId: number) => {
    // Navigate to booking details or tracking page
    navigate(`/my-bookings`);
  };
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* User role tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          <button className="px-4 py-2 text-primary border-b-2 border-primary font-medium">
            {t("passenger.tab")}
          </button>
          {user?.role === "bus_owner" && (
            <button 
              className="px-4 py-2 text-gray-500 font-medium"
              onClick={() => navigate("/")}
            >
              {t("owner.tab")}
            </button>
          )}
        </div>
      </div>
      
      {/* Search section */}
      <SearchForm onSearch={handleSearch} />
      
      {/* Search results */}
      {searchParams && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t("passenger.availableBuses")}</h2>
            {searchResults && searchResults.length > 0 && (
              <div className="flex items-center">
                <label className="mr-2 text-sm text-gray-600">{t("passenger.sort")}:</label>
                <select className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-primary focus:border-primary">
                  <option>{t("passenger.sortDeparture")}</option>
                  <option>{t("passenger.sortPriceLow")}</option>
                  <option>{t("passenger.sortPriceHigh")}</option>
                  <option>{t("passenger.sortDuration")}</option>
                  <option>{t("passenger.sortRating")}</option>
                </select>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <>
              {searchResults.map((result: any) => (
                <BusCard 
                  key={result.id}
                  bus={result.bus}
                  schedule={result}
                  route={result.route}
                  availableSeats={result.bus.capacity - 5} // Placeholder, would be calculated from bookings
                  rating={4.5} // Placeholder, would come from reviews
                  reviewCount={19} // Placeholder, would come from reviews
                  onSelectBus={() => handleSelectBus(result.bus, result, result.route)}
                />
              ))}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No buses found</h3>
              <p className="text-gray-600">
                No buses are available for the selected route and date. Please try different dates or routes.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Seat selection section */}
      {showSeatSelection && selectedBus && selectedSchedule && selectedRoute && (
        <div id="seatSelectionSection">
          <SeatSelection 
            bus={selectedBus}
            schedule={selectedSchedule}
            route={selectedRoute}
            onClose={() => setShowSeatSelection(false)}
            onSuccess={handleBookingSuccess}
          />
        </div>
      )}
      
      {/* Bus tracking section */}
      {showBusTracking && selectedBus && selectedSchedule && selectedRoute && (
        <div id="busTrackingSection">
          <BusTracking 
            bus={selectedBus}
            schedule={selectedSchedule}
            route={selectedRoute}
            location={{
              latitude: "6.9271",
              longitude: "79.8612",
              speed: 48,
              timestamp: new Date().toISOString()
            }}
            onClose={() => setShowBusTracking(false)}
          />
        </div>
      )}
      
      {/* Popular routes section */}
      <PopularRoutes />
    </main>
  );
}
