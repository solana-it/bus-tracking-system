import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import PassengerPage from "@/pages/passenger-page";
import BusOwnerPage from "@/pages/bus-owner-page";
import MyBookingsPage from "@/pages/my-bookings-page";
import BusTrackingPage from "@/pages/bus-tracking-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import MobileNavigation from "./components/layout/mobile-navigation";
import { useAuth } from "./hooks/use-auth";

function Router() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Switch>
        {/* Auth routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes */}
        <ProtectedRoute 
          path="/" 
          component={user?.role === "bus_owner" ? BusOwnerPage : PassengerPage} 
        />
        <ProtectedRoute path="/my-bookings" component={MyBookingsPage} />
        <ProtectedRoute path="/track/:id" component={BusTrackingPage} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <Footer />
      <MobileNavigation />
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
