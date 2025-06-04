import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BusTracking from "@/components/passenger/bus-tracking";

export default function BusTrackingPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [location, setLocation] = useState<any>(null);
  const [busWebSocket, setBusWebSocket] = useState<WebSocket | null>(null);
  
  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: [`/api/bookings/${id}`],
  });
  
  // Setup WebSocket for real-time location updates
  useEffect(() => {
    if (booking && booking.schedule && booking.schedule.bus) {
      const busId = booking.schedule.bus.id;
      
      // Connect to WebSocket server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        // Subscribe to bus location updates
        socket.send(JSON.stringify({
          type: "subscribe",
          channel: `bus_location_${busId}`
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "location_update") {
            setLocation(data.location);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      setBusWebSocket(socket);
      
      // Cleanup on unmount
      return () => {
        socket.close();
      };
    }
  }, [booking]);
  
  // If no booking is loaded yet, fetch the current location
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      if (booking && booking.schedule && booking.schedule.bus) {
        try {
          const busId = booking.schedule.bus.id;
          const response = await fetch(`/api/location/${busId}`);
          
          if (response.ok) {
            const data = await response.json();
            setLocation(data);
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }
    };
    
    if (booking && !location) {
      fetchCurrentLocation();
    }
  }, [booking, location]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Booking not found</h3>
          <p className="text-gray-600 mb-6">
            The booking you are trying to track could not be found.
          </p>
          <Button onClick={() => navigate("/my-bookings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("tracking.title")}</h1>
        <Button variant="outline" onClick={() => navigate("/my-bookings")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <BusTracking 
        bus={booking.schedule.bus}
        schedule={booking.schedule}
        route={booking.schedule.route}
        location={location}
        onClose={() => navigate("/my-bookings")}
      />
    </main>
  );
}
