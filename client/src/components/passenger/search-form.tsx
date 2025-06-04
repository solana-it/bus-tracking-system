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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Search, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Form schema
const searchFormSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required").refine(
    (val, ctx) => val !== ctx.data.from,
    "From and To locations cannot be the same"
  ),
  date: z.string().min(1, "Date is required"),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const { t } = useLanguage();
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  
  // Fetch all routes to get available locations
  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });
  
  // Extract unique locations from routes
  const locations = routes 
    ? [...new Set([
        ...routes.map((route: any) => route.fromLocation),
        ...routes.map((route: any) => route.toLocation)
      ])].sort()
    : [];
  
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      from: "",
      to: "",
      date: currentDate,
    },
  });
  
  const handleSubmit = (data: SearchFormData) => {
    onSearch(data);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-medium mb-4">{t("passenger.findBus")}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passenger.from")}</FormLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={t("passenger.selectCity")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location: string) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passenger.to")}</FormLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={t("passenger.selectCity")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location: string) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passenger.date")}</FormLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <FormControl>
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        min={currentDate}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-center">
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md shadow-sm">
              <Search className="mr-2 h-4 w-4" />
              {t("passenger.search")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
