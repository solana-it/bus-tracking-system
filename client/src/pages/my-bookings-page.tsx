import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Loader2, MapPin, Calendar, Clock, Bus, Ticket, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MyBookingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });
  
  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("POST", `/api/bookings/${bookingId}/cancel`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
      setCancelDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    if (!bookings) return [];
    
    const now = new Date();
    
    return bookings.filter((booking: any) => {
      const departureTime = new Date(booking.schedule.departureTime);
      
      if (activeTab === "upcoming") {
        return booking.status === "confirmed" && departureTime > now;
      } else if (activeTab === "past") {
        return booking.status === "completed" || (booking.status === "confirmed" && departureTime < now);
      } else if (activeTab === "cancelled") {
        return booking.status === "cancelled";
      }
      
      return true;
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Handle cancel booking
  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };
  
  // Confirm cancel booking
  const confirmCancelBooking = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id);
    }
  };
  
  // Handle track bus
  const handleTrackBus = (bookingId: number) => {
    navigate(`/track/${bookingId}`);
  };
  
  // Handle view ticket
  const handleViewTicket = (booking: any) => {
    // In a real app, this would open a ticket view or pdf
    toast({
      title: "Ticket View",
      description: `Viewing ticket for booking #${booking.id}`,
    });
  };
  
  const filteredBookings = getFilteredBookings();
  
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t("booking.myBookings")}</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">{t("booking.upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("booking.past")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("booking.cancelled")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="bg-primary p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{booking.schedule.route.fromLocation} to {booking.schedule.route.toLocation}</h3>
                      <Badge variant="outline" className="bg-white text-primary hover:bg-white">
                        {t("booking.ticketNumber")} {booking.id}
                      </Badge>
                    </div>
                    <p className="text-sm">{booking.schedule.bus.name} ({booking.schedule.bus.busNumber})</p>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start mb-3">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(booking.schedule.departureTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("booking.travelDate")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start mb-3">
                      <div className="mr-3">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                          <MapPin className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(booking.schedule.departureTime)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.schedule.route.fromLocation}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(booking.schedule.arrivalTime)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.schedule.route.toLocation}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">Seats:</span>
                        <span>{booking.seats.join(", ")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">Amount:</span>
                        <span>Rs. {booking.totalPrice}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{t("booking.status")}:</span>
                        <span className={
                          booking.status === "confirmed" ? "text-green-500" :
                          booking.status === "cancelled" ? "text-red-500" :
                          "text-blue-500"
                        }>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
                    {activeTab === "upcoming" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTicket(booking)}
                        >
                          <Ticket className="h-4 w-4 mr-1" />
                          {t("booking.viewTicket")}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleTrackBus(booking.id)}
                        >
                          <Bus className="h-4 w-4 mr-1" />
                          {t("booking.track")}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          {t("booking.cancel")}
                        </Button>
                      </>
                    )}
                    {activeTab === "past" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTicket(booking)}
                      >
                        <Ticket className="h-4 w-4 mr-1" />
                        {t("booking.viewTicket")}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === "upcoming" && "You don't have any upcoming bookings."}
                {activeTab === "past" && "You don't have any past bookings."}
                {activeTab === "cancelled" && "You don't have any cancelled bookings."}
              </p>
              <Button onClick={() => navigate("/")}>
                Book a Bus
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              No, keep it
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelBooking}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? "Cancelling..." : "Yes, cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
