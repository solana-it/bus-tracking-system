import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { X, CalendarDays, Circle, MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface SeatSelectionProps {
  bus: any;
  schedule: any;
  route: any;
  onClose: () => void;
  onSuccess: (bookingId: number) => void;
}

export default function SeatSelection({
  bus,
  schedule,
  route,
  onClose,
  onSuccess,
}: SeatSelectionProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [busSeats, setBusSeats] = useState<any[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Initialize seats based on bus layout
  useEffect(() => {
    if (bus && bus.seatLayout) {
      // In a real app, the seat layout would come from the API
      // For this MVP, generate a simple layout
      const layout = [];
      const rows = Math.ceil(bus.capacity / 4); // 4 seats per row
      
      for (let row = 1; row <= rows; row++) {
        for (let col of ['A', 'B', 'C', 'D']) {
          // Skip C for first row (driver's area)
          if (row === 1 && (col === 'C' || col === 'D')) continue;
          
          const seatNumber = `${row}${col}`;
          layout.push({
            id: seatNumber,
            row,
            col,
            position: col === 'A' || col === 'B' ? 'left' : 'right',
            status: bookedSeats.includes(seatNumber) ? 'booked' : 'available'
          });
        }
      }
      
      setBusSeats(layout);
    }
  }, [bus, bookedSeats]);
  
  // Fetch booked seats for this schedule
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/schedules/${schedule.id}/bookings`);
        
        if (!res.ok) {
          // If there's no endpoint for this, we'll just use an empty array
          setBookedSeats([]);
          return;
        }
        
        const data = await res.json();
        const allBookedSeats = data.flatMap((booking: any) => 
          booking.status !== "cancelled" ? booking.seats : []
        );
        
        setBookedSeats(allBookedSeats);
      } catch (error) {
        // In case of error, just use empty array
        setBookedSeats([]);
      }
    };
    
    if (schedule) {
      fetchBookings();
    }
  }, [schedule]);
  
  // Handle seat selection
  const handleSeatClick = (seat: any) => {
    if (seat.status === 'booked') return;
    
    if (selectedSeat === seat.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat.id);
    }
  };
  
  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking successful",
        description: "Your seat has been booked successfully.",
      });
      onSuccess(data.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle booking
  const handleBooking = () => {
    if (!selectedSeat) {
      toast({
        title: "No seat selected",
        description: "Please select a seat to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to book a seat.",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      scheduleId: schedule.id,
      seats: [selectedSeat],
      totalPrice: schedule.price
    };
    
    bookingMutation.mutate(bookingData);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t("seat.title")}</h2>
        <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Bus Details Recap */}
        <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{bus.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                <path d="M10 9a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M10 13a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span>Bus #{bus.busNumber}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>{formatDate(schedule.departureTime)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-start mb-3">
              <div className="mr-3">
                <div className="flex flex-col items-center">
                  <Circle className="h-4 w-4 text-gray-500" />
                  <div className="w-0.5 h-6 bg-gray-300"></div>
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{formatTime(schedule.departureTime)}</div>
                  <div className="text-xs text-gray-500">{route.fromLocation}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatTime(schedule.arrivalTime)}</div>
                  <div className="text-xs text-gray-500">{route.toLocation}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t("seat.status")}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span>{t("seat.available")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                <span>{t("seat.booked")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded mr-2"></div>
                <span>{t("seat.selected")}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded border border-dashed border-gray-500 mr-2"></div>
                <span>{t("seat.reserved")}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seat Layout */}
        <div className="md:w-2/3">
          <div className="mb-4 text-center">
            <div className="inline-block border border-gray-300 rounded p-2 mb-2">
              <span className="text-sm text-gray-500">{t("seat.driver")}</span>
            </div>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-5 gap-2 w-full max-w-md">
              {/* Create a space in the middle of each row */}
              {busSeats.map((seat) => (
                <div key={seat.id} className={`${
                  seat.position === 'left' ? 'col-span-1' : 
                  seat.position === 'right' ? 'col-span-1' : 'invisible'
                }`}>
                  <button 
                    className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium ${
                      seat.status === 'booked' 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : selectedSeat === seat.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 hover:bg-primary-light'
                    }`}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'booked'}
                  >
                    {seat.id}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-600">{t("seat.selectedSeat")}:</span>
                <span className="ml-2 font-medium">{selectedSeat || '-'}</span>
              </div>
              <div className="text-primary font-medium">Rs. {schedule.price}</div>
            </div>
            
            <Button 
              className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 rounded-md shadow-sm"
              onClick={handleBooking}
              disabled={!selectedSeat || bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Processing..." : t("seat.continuePayment")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
