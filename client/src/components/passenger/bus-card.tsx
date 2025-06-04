import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Star, Circle, MapPin } from "lucide-react";

interface BusCardProps {
  bus: {
    id: number;
    name: string;
    busNumber: string;
    hasAc: boolean;
    hasWifi: boolean;
    hasUsb: boolean;
    capacity: number;
  };
  schedule: {
    id: number;
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  route: {
    fromLocation: string;
    toLocation: string;
    estimatedDuration: number;
  };
  availableSeats: number;
  rating: number;
  reviewCount: number;
  onSelectBus: () => void;
}

export default function BusCard({
  bus,
  schedule,
  route,
  availableSeats,
  rating,
  reviewCount,
  onSelectBus,
}: BusCardProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  
  // Format departure and arrival times
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <span className="font-medium text-gray-900">{bus.name}</span>
              {bus.hasAc && (
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {t("passenger.amenities.ac")}
                </Badge>
              )}
              {bus.hasWifi && (
                <Badge variant="outline" className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {t("passenger.amenities.wifi")}
                </Badge>
              )}
              {bus.hasUsb && (
                <Badge variant="outline" className="ml-1 bg-purple-100 text-purple-800 hover:bg-purple-100">
                  {t("passenger.amenities.usb")}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <Star className="h-4 w-4 mr-1 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              <span className="mr-4">{reviewCount} {t("passenger.reviews")}</span>
              <span>Bus #{bus.busNumber}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-primary">Rs. {schedule.price.toLocaleString()}</div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center pt-4 border-t border-gray-200 mt-4">
          <div className="flex-1 flex items-start mb-4 md:mb-0">
            <div className="mr-3">
              <div className="flex flex-col items-center">
                <Circle className="text-xl text-gray-500" />
                <div className="w-0.5 h-10 bg-gray-300"></div>
                <MapPin className="text-xl text-gray-500" />
              </div>
            </div>
            <div>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900">{formatTime(schedule.departureTime)}</div>
                <div className="text-sm text-gray-500">{route.fromLocation}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{formatTime(schedule.arrivalTime)}</div>
                <div className="text-sm text-gray-500">{route.toLocation}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center mx-4 mb-4 md:mb-0">
            <div className="text-sm font-medium text-gray-900">{formatDuration(route.estimatedDuration)}</div>
            <div className="text-xs text-gray-500">Direct</div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="text-sm text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                <path d="M10 9a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M10 13a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span>{availableSeats} {t("passenger.seatsLeft")}</span>
            </div>
            <Button className="bg-secondary hover:bg-secondary-dark text-white" onClick={onSelectBus}>
              {t("passenger.bookNow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
