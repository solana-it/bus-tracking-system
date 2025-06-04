import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBusSchema } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

// Extended schema for bus form
const busFormSchema = insertBusSchema.extend({
  // Visual validation only
  name: z.string().min(3, "Bus name must be at least 3 characters"),
  busNumber: z.string().min(2, "Bus number must be at least 2 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(100, "Capacity must be less than 100"),
});

type BusFormData = z.infer<typeof busFormSchema>;

interface BusFormProps {
  onSuccess?: () => void;
  bus?: any; // For editing
}

export default function BusForm({ onSuccess, bus }: BusFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isEditing = !!bus;
  
  // Form with default values
  const form = useForm<BusFormData>({
    resolver: zodResolver(busFormSchema),
    defaultValues: {
      name: bus?.name || "",
      busNumber: bus?.busNumber || "",
      capacity: bus?.capacity || 40,
      hasAc: bus?.hasAc || false,
      hasWifi: bus?.hasWifi || false,
      hasUsb: bus?.hasUsb || false,
      seatLayout: bus?.seatLayout || {},
    },
  });
  
  // Create simple seat layout based on capacity
  const generateSeatLayout = (capacity: number) => {
    const layout: Record<string, string> = {};
    const rows = Math.ceil(capacity / 4); // 4 seats per row
    
    for (let row = 1; row <= rows; row++) {
      for (let col of ['A', 'B', 'C', 'D']) {
        // Skip C for first row (driver's area)
        if (row === 1 && (col === 'C' || col === 'D')) continue;
        
        const seatNumber = `${row}${col}`;
        layout[seatNumber] = 'available';
      }
    }
    
    return layout;
  };
  
  // Create/update mutation
  const mutation = useMutation({
    mutationFn: async (data: BusFormData) => {
      // Generate seat layout if not provided
      if (!data.seatLayout || Object.keys(data.seatLayout).length === 0) {
        data.seatLayout = generateSeatLayout(data.capacity);
      }
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/buses/${bus.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/buses", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buses"] });
      toast({
        title: isEditing ? "Bus updated" : "Bus added",
        description: isEditing ? "Bus has been updated successfully" : "Bus has been added successfully",
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
  
  const onSubmit = (data: BusFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("owner.busName")}</FormLabel>
              <FormControl>
                <Input placeholder="Southern Express" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="busNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("owner.busNumber")}</FormLabel>
              <FormControl>
                <Input placeholder="NA-5678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("owner.capacity")}</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={100} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t("owner.amenities")}</h3>
          
          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="hasAc"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                  <FormLabel className="m-0">{t("passenger.amenities.ac")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasWifi"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                  <FormLabel className="m-0">{t("passenger.amenities.wifi")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasUsb"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                  <FormLabel className="m-0">{t("passenger.amenities.usb")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button 
          type="submit"
          className="w-full" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : isEditing ? "Update Bus" : "Add Bus"}
        </Button>
      </form>
    </Form>
  );
}
