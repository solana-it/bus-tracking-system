import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertScheduleSchema } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

// Extended schema for schedule form
const scheduleFormSchema = insertScheduleSchema.extend({
  // Visual validation only
  busId: z.coerce.number().min(1, "Bus is required"),
  routeId: z.coerce.number().min(1, "Route is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  price: z.coerce.number().min(10, "Price must be at least Rs. 10"),
}).refine(data => {
  const departureTime = new Date(data.departureTime);
  const arrivalTime = new Date(data.arrivalTime);
  return arrivalTime > departureTime;
}, {
  message: "Arrival time must be after departure time",
  path: ["arrivalTime"],
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  onSuccess?: () => void;
  schedule?: any; // For editing
}

export default function ScheduleForm({ onSuccess, schedule }: ScheduleFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isEditing = !!schedule;
  
  // Fetch buses and routes
  const { data: buses } = useQuery({
    queryKey: ["/api/buses"],
  });
  
  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });
  
  // Format datetime string for input
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, -8); // YYYY-MM-DDTHH:MM
  };
  
  // Form with default values
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      busId: schedule?.busId || "",
      routeId: schedule?.routeId || "",
      departureTime: formatDateTime(schedule?.departureTime) || "",
      arrivalTime: formatDateTime(schedule?.arrivalTime) || "",
      price: schedule?.price || 0,
      available: schedule?.available ?? true,
    },
  });
  
  // Auto-calculate arrival time when route and departure time change
  const watchRouteId = form.watch("routeId");
  const watchDepartureTime = form.watch("departureTime");
  
  const calculateArrivalTime = () => {
    if (watchRouteId && watchDepartureTime) {
      const selectedRoute = routes?.find((r: any) => r.id === parseInt(watchRouteId));
      if (selectedRoute) {
        const departureTime = new Date(watchDepartureTime);
        const arrivalTime = new Date(departureTime.getTime() + selectedRoute.estimatedDuration * 60000);
        form.setValue("arrivalTime", formatDateTime(arrivalTime.toISOString()));
      }
    }
  };
  
  // Create/update mutation
  const mutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/schedules/${schedule.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/schedules", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: isEditing ? "Schedule updated" : "Schedule added",
        description: isEditing ? "Schedule has been updated successfully" : "Schedule has been added successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ScheduleFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="busId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bus</FormLabel>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {buses?.map((bus: any) => (
                    <SelectItem key={bus.id} value={bus.id.toString()}>
                      {bus.name} ({bus.busNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="routeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route</FormLabel>
              <Select
                value={field.value.toString()}
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  setTimeout(calculateArrivalTime, 0);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {routes?.map((route: any) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.fromLocation} to {route.toLocation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="departureTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departure Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    setTimeout(calculateArrivalTime, 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="arrivalTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arrival Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (Rs.)</FormLabel>
              <FormControl>
                <Input type="number" min={0} step={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="available"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
              <FormLabel className="m-0">Available for booking</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          className="w-full" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : isEditing ? "Update Schedule" : "Add Schedule"}
        </Button>
      </form>
    </Form>
  );
}
