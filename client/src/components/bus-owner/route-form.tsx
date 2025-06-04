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
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertRouteSchema } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

// Extended schema for route form
const routeFormSchema = insertRouteSchema.extend({
  // Visual validation only
  fromLocation: z.string().min(2, "From location must be at least 2 characters"),
  toLocation: z.string().min(2, "To location must be at least 2 characters"),
  distance: z.coerce.number().optional(),
  estimatedDuration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
}).refine(data => data.fromLocation !== data.toLocation, {
  message: "From and To locations cannot be the same",
  path: ["toLocation"],
});

type RouteFormData = z.infer<typeof routeFormSchema>;

interface RouteFormProps {
  onSuccess?: () => void;
  route?: any; // For editing
}

export default function RouteForm({ onSuccess, route }: RouteFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const isEditing = !!route;
  
  // Form with default values
  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      fromLocation: route?.fromLocation || "",
      toLocation: route?.toLocation || "",
      distance: route?.distance || undefined,
      estimatedDuration: route?.estimatedDuration || 60, // Default 1 hour
    },
  });
  
  // Create/update mutation
  const mutation = useMutation({
    mutationFn: async (data: RouteFormData) => {
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/routes/${route.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/routes", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: isEditing ? "Route updated" : "Route added",
        description: isEditing ? "Route has been updated successfully" : "Route has been added successfully",
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
  
  const onSubmit = (data: RouteFormData) => {
    mutation.mutate(data);
  };
  
  // Convert minutes to hours and minutes for display
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fromLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("passenger.from")}</FormLabel>
              <FormControl>
                <Input placeholder="Colombo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="toLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("passenger.to")}</FormLabel>
              <FormControl>
                <Input placeholder="Kandy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (km)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="120" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="estimatedDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1}
                  placeholder="180" 
                  {...field} 
                />
              </FormControl>
              <p className="text-sm text-gray-500 mt-1">
                {formatDuration(field.value)}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          className="w-full" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : isEditing ? "Update Route" : "Add Route"}
        </Button>
      </form>
    </Form>
  );
}
