import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { X, PhoneCall, AlertTriangle, Bus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { sriLankaLocations, calculateETA } from "@/lib/map-utils";

interface BusTrackingProps {
  bus: any;
  schedule: any;
  route: any;
  location?: {
    latitude: string;
    longitude: string;
    speed: number;
    timestamp: string;
  };
  onClose: () => void;
}

export default function BusTracking({
  bus,
  schedule,
  route,
  location,
  onClose,
}: BusTrackingProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const [currentLocation, setCurrentLocation] = useState("Updating...");
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Format ETA
  const formatETA = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Update bus progress and ETA based on location updates
  useEffect(() => {
    if (location) {
      // For the MVP, calculate a simple progress percentage
      // In a real app, this would be based on actual GPS coordinates
      const departureTime = new Date(schedule.departureTime).getTime();
      const arrivalTime = new Date(schedule.arrivalTime).getTime();
      const currentTime = new Date().getTime();
      
      // Calculate progress as percentage of journey completed
      const totalJourneyTime = arrivalTime - departureTime;
      const timeElapsed = currentTime - departureTime;
      const calculatedProgress = Math.min(100, Math.max(0, (timeElapsed / totalJourneyTime) * 100));
      
      setProgress(calculatedProgress);
      
      // Calculate ETA
      const remainingTimeMs = arrivalTime - currentTime;
      const remainingTimeMinutes = Math.max(0, Math.floor(remainingTimeMs / (1000 * 60)));
      setEta(remainingTimeMinutes);
      
      // Set current location
      // In a real app, this would reverse geocode the coordinates
      // For MVP, we'll use placeholder locations based on progress
      const locations = [
        "Colombo Outskirts",
        "Nittambuwa",
        "Ambepussa",
        "Warakapola",
        "Kegalle",
        "Mawanella",
        "Kadugannawa",
        "Peradeniya",
        "Kandy Approaching"
      ];
      
      const locationIndex = Math.min(
        locations.length - 1, 
        Math.floor((calculatedProgress / 100) * locations.length)
      );
      
      setCurrentLocation(locations[locationIndex]);
    }
  }, [location, schedule]);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t("tracking.title")}</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Bus Details */}
        <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{bus.name}</h3>
            <div className="text-sm text-gray-500 mb-2">Bus #{bus.busNumber}</div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{new Date(schedule.departureTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-primary font-medium">
              <Bus className="h-4 w-4 mr-1" />
              <span>{t("tracking.onSchedule")}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-start mb-3">
              <div className="mr-3">
                <div className="flex flex-col items-center">
                  <span className="text-primary">●</span>
                  <div className="w-0.5 h-6 bg-primary"></div>
                  <span className="text-gray-400">●</span>
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {t("tracking.departed")} {formatTime(schedule.departureTime)}
                  </div>
                  <div className="text-xs text-gray-500">{route.fromLocation}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {t("tracking.arriving")} {formatTime(schedule.arrivalTime)}
                  </div>
                  <div className="text-xs text-gray-500">{route.toLocation}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t("tracking.journeyProgress")}</h4>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-primary">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    {t("tracking.eta")}: {formatETA(eta)}
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              <div className="flex justify-between mb-1">
                <span>{t("tracking.currentLocation")}:</span>
                <span className="font-medium">{currentLocation}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("tracking.currentSpeed")}:</span>
                <span className="font-medium">{location?.speed || 0} km/h</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="outline" className="flex items-center text-primary">
              <PhoneCall className="h-4 w-4 mr-1" />
              {t("tracking.contactDriver")}
            </Button>
            <Button variant="outline" className="flex items-center text-red-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {t("tracking.reportIssue")}
            </Button>
          </div>
        </div>
        
        {/* Map View */}
        <div className="md:w-2/3 h-80 md:h-96 rounded-lg overflow-hidden relative bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            {/* In a real application, this would be replaced with a real map implementation */}
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm">Live Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
