import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Bus, Route, Calendar, Ticket, CreditCard } from "lucide-react";
import { Loader2 } from "lucide-react";
import BusForm from "@/components/bus-owner/bus-form";
import ScheduleForm from "@/components/bus-owner/schedule-form";
import BookingsList from "@/components/bus-owner/bookings-list";

export default function BusOwnerPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddBusDialog, setShowAddBusDialog] = useState(false);
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);
  const [showUpdateBusDialog, setShowUpdateBusDialog] = useState(false);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  
  // Fetch buses
  const { data: buses, isLoading: loadingBuses } = useQuery({
    queryKey: ["/api/buses"],
  });
  
  // Fetch schedules
  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ["/api/schedules"],
  });
  
  // Calculate stats for dashboard
  const totalBuses = buses?.length || 0;
  const totalSchedules = schedules?.length || 0;
  const activeSchedules = schedules?.filter((schedule: any) => schedule.available).length || 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  };
  
  // Calculate total earnings (placeholder)
  const totalEarnings = 15000; // This would come from a real API
  
  // Handle edit bus
  const handleEditBus = (bus: any) => {
    setSelectedBus(bus);
    setShowUpdateBusDialog(true);
  };
  
  return (
    <main className="container mx-auto px-4 py-6">
      {/* User role tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-300">
          {user?.role === "passenger" && (
            <button 
              className="px-4 py-2 text-gray-500 font-medium"
              onClick={() => navigate("/")}
            >
              {t("passenger.tab")}
            </button>
          )}
          <button className="px-4 py-2 text-primary border-b-2 border-primary font-medium">
            {t("owner.tab")}
          </button>
        </div>
      </div>
      
      {/* Bus owner dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">{t("owner.dashboard")}</TabsTrigger>
          <TabsTrigger value="buses">{t("owner.manageBuses")}</TabsTrigger>
          <TabsTrigger value="schedules">{t("owner.manageSchedules")}</TabsTrigger>
          <TabsTrigger value="bookings">{t("owner.bookings")}</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t("owner.manageBuses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Bus className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{totalBuses}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t("owner.manageSchedules")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{totalSchedules}</span>
                  <span className="text-sm text-gray-500 ml-2">({activeSchedules} active)</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t("owner.bookings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold">12</span> {/* Placeholder */}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t("owner.earnings")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">{formatCurrency(totalEarnings)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-lg font-medium mb-4">Recent Bookings</h2>
          <BookingsList />
        </TabsContent>
        
        {/* Buses Tab */}
        <TabsContent value="buses">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">{t("owner.manageBuses")}</h2>
            <Button onClick={() => setShowAddBusDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("owner.addBus")}
            </Button>
          </div>
          
          {loadingBuses ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : buses && buses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus: any) => (
                <Card key={bus.id} className="overflow-hidden">
                  <div className="bg-primary p-4 text-white">
                    <h3 className="font-medium">{bus.name}</h3>
                    <p className="text-sm">Bus #{bus.busNumber}</p>
                  </div>
                  <CardContent className="p-4">
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">{t("owner.capacity")}:</span>
                      <span>{bus.capacity} seats</span>
                    </p>
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">{t("owner.amenities")}:</span>
                      <span className="flex space-x-1">
                        {bus.hasAc && <span className="text-green-500">AC</span>}
                        {bus.hasWifi && <span className="text-blue-500">WiFi</span>}
                        {bus.hasUsb && <span className="text-purple-500">USB</span>}
                      </span>
                    </p>
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditBus(bus)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Bus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No buses found</h3>
              <p className="text-gray-600 mb-6">
                You haven't added any buses yet. Click the button below to add your first bus.
              </p>
              <Button onClick={() => setShowAddBusDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("owner.addBus")}
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Schedules Tab */}
        <TabsContent value="schedules">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">{t("owner.manageSchedules")}</h2>
            <Button onClick={() => setShowAddScheduleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
          
          {loadingSchedules ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : schedules && schedules.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schedules.map((schedule: any) => (
                <Card key={schedule.id} className={`overflow-hidden ${!schedule.available ? 'opacity-70' : ''}`}>
                  <div className="bg-primary p-4 text-white flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{schedule.route?.fromLocation} to {schedule.route?.toLocation}</h3>
                      <p className="text-sm">{new Date(schedule.departureTime).toLocaleDateString()}</p>
                    </div>
                    <div className="text-xl font-bold">Rs. {schedule.price}</div>
                  </div>
                  <CardContent className="p-4">
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">Bus:</span>
                      <span>{schedule.bus?.name} (#{schedule.bus?.busNumber})</span>
                    </p>
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">Departure:</span>
                      <span>{new Date(schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </p>
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">Arrival:</span>
                      <span>{new Date(schedule.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </p>
                    <p className="flex justify-between py-1 border-b">
                      <span className="text-gray-500">Status:</span>
                      <span className={schedule.available ? 'text-green-500' : 'text-red-500'}>
                        {schedule.available ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button 
                        variant={schedule.available ? "destructive" : "default"} 
                        size="sm"
                      >
                        {schedule.available ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No schedules found</h3>
              <p className="text-gray-600 mb-6">
                You haven't added any schedules yet. Click the button below to add your first schedule.
              </p>
              <Button onClick={() => setShowAddScheduleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <h2 className="text-lg font-medium mb-6">{t("owner.bookings")}</h2>
          <BookingsList />
        </TabsContent>
      </Tabs>
      
      {/* Add Bus Dialog */}
      <Dialog open={showAddBusDialog} onOpenChange={setShowAddBusDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("owner.addBus")}</DialogTitle>
            <DialogDescription>
              Add a new bus to your fleet. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <BusForm onSuccess={() => setShowAddBusDialog(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Update Bus Dialog */}
      <Dialog open={showUpdateBusDialog} onOpenChange={setShowUpdateBusDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Update Bus</DialogTitle>
            <DialogDescription>
              Update bus details.
            </DialogDescription>
          </DialogHeader>
          <BusForm 
            bus={selectedBus} 
            onSuccess={() => setShowUpdateBusDialog(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Schedule Dialog */}
      <Dialog open={showAddScheduleDialog} onOpenChange={setShowAddScheduleDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule for your bus. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm onSuccess={() => setShowAddScheduleDialog(false)} />
        </DialogContent>
      </Dialog>
    </main>
  );
}
