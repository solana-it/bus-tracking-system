// Translations for the application
// English is the base language and should always have all keys
// Other languages can be partial and will fall back to English

export const translations: Record<string, Record<string, string>> = {
  // English translations
  en: {
    // General
    "app.name": "SL Bus",
    "app.tagline": "Book and track buses across Sri Lanka with ease",
    
    // Auth
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.name": "Full Name",
    "auth.phone": "Phone Number",
    "auth.role": "Account Type",
    "auth.role.passenger": "Passenger",
    "auth.role.bus_owner": "Bus Owner",
    "auth.loginTitle": "Welcome Back",
    "auth.loginSubtitle": "Sign in to your account",
    "auth.registerTitle": "Create an Account",
    "auth.registerSubtitle": "Join SL Bus today",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.hero.title": "Travel Smarter Across Sri Lanka",
    "auth.hero.subtitle": "Book buses, track your journey, and travel with confidence",
    "auth.hero.point1": "Easy bus booking from anywhere",
    "auth.hero.point2": "Real-time GPS tracking",
    "auth.hero.point3": "Digital tickets for hassle-free travel",
    
    // Navigation
    "nav.home": "Home",
    "nav.myBookings": "My Bookings",
    "nav.track": "Track",
    "nav.profile": "Profile",
    "nav.search": "Search",
    "nav.myBuses": "My Buses",
    "nav.schedules": "Schedules",
    
    // Passenger
    "passenger.tab": "Passenger",
    "passenger.findBus": "Find Your Bus",
    "passenger.from": "From",
    "passenger.to": "To",
    "passenger.date": "Date",
    "passenger.search": "Search Buses",
    "passenger.selectCity": "Select city",
    "passenger.availableBuses": "Available Buses",
    "passenger.sort": "Sort by",
    "passenger.sortDeparture": "Departure Time",
    "passenger.sortPriceLow": "Price: Low to High",
    "passenger.sortPriceHigh": "Price: High to Low",
    "passenger.sortDuration": "Duration",
    "passenger.sortRating": "Rating",
    "passenger.bookNow": "Book Now",
    "passenger.seatsLeft": "seats left",
    "passenger.amenities.ac": "AC",
    "passenger.amenities.wifi": "WiFi",
    "passenger.amenities.usb": "USB",
    "passenger.reviews": "Reviews",
    "passenger.popularRoutes": "Popular Routes",
    "passenger.dailyDepartures": "Daily departures",
    "passenger.from": "From",
    
    // Seat Selection
    "seat.title": "Select Your Seats",
    "seat.driver": "Driver",
    "seat.status": "Seat Status",
    "seat.available": "Available",
    "seat.booked": "Booked",
    "seat.selected": "Selected",
    "seat.reserved": "Reserved",
    "seat.selectedSeat": "Selected Seat",
    "seat.continuePayment": "Continue to Payment",
    
    // Bus Tracking
    "tracking.title": "Track Your Bus",
    "tracking.onSchedule": "On schedule",
    "tracking.departed": "Departed",
    "tracking.arriving": "Arriving",
    "tracking.journeyProgress": "Journey Progress",
    "tracking.eta": "ETA",
    "tracking.currentLocation": "Current Location",
    "tracking.currentSpeed": "Current Speed",
    "tracking.contactDriver": "Contact Driver",
    "tracking.reportIssue": "Report Issue",
    
    // Bus Owner
    "owner.tab": "Bus Owner",
    "owner.dashboard": "Dashboard",
    "owner.addBus": "Add New Bus",
    "owner.manageBuses": "Manage Buses",
    "owner.manageRoutes": "Manage Routes",
    "owner.manageSchedules": "Manage Schedules",
    "owner.bookings": "Bookings",
    "owner.earnings": "Earnings",
    "owner.busDetails": "Bus Details",
    "owner.busName": "Bus Name",
    "owner.busNumber": "Bus Number",
    "owner.capacity": "Capacity",
    "owner.amenities": "Amenities",
    
    // Bookings
    "booking.myBookings": "My Bookings",
    "booking.upcoming": "Upcoming",
    "booking.past": "Past",
    "booking.cancelled": "Cancelled",
    "booking.ticketNumber": "Ticket #",
    "booking.bookingDate": "Booking Date",
    "booking.travelDate": "Travel Date",
    "booking.status": "Status",
    "booking.cancel": "Cancel Booking",
    "booking.viewTicket": "View Ticket",
    "booking.track": "Track Bus",
    
    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.support": "Support",
    "footer.connectWithUs": "Connect With Us",
    "footer.helpCenter": "Help Center",
    "footer.contactUs": "Contact Us",
    "footer.termsOfService": "Terms of Service",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.copyright": "© 2023 SL Bus. All rights reserved.",
    
    // Errors
    "error.required": "This field is required",
    "error.minLength": "Must be at least {{min}} characters",
    "error.maxLength": "Must be at most {{max}} characters",
    "error.invalidEmail": "Invalid email address",
    "error.passwordsMatch": "Passwords do not match",
    "error.serverError": "Server error. Please try again later.",
    "error.notFound": "The requested resource was not found.",
    "error.unauthorized": "You need to log in to access this resource.",
    "error.forbidden": "You don't have permission to access this resource.",
  },
  
  // Sinhala translations
  si: {
    // General
    "app.name": "SL බස්",
    "app.tagline": "ශ්‍රී ලංකාව පුරා බස් වෙන්කරවා ගැනීම සහ පසුවිපරම් කිරීම",
    
    // Auth
    "auth.login": "පිවිසෙන්න",
    "auth.register": "ලියාපදිංචි වන්න",
    "auth.logout": "ඉවත් වන්න",
    "auth.email": "විද්‍යුත් තැපෑල",
    "auth.username": "පරිශීලක නාමය",
    "auth.password": "මුරපදය",
    "auth.confirmPassword": "මුරපදය තහවුරු කරන්න",
    "auth.name": "සම්පූර්ණ නම",
    "auth.phone": "දුරකථන අංකය",
    "auth.role": "ගිණුම් වර්ගය",
    "auth.role.passenger": "මගියා",
    "auth.role.bus_owner": "බස් හිමිකරු",
    
    // Navigation
    "nav.home": "නිවස",
    "nav.myBookings": "මගේ වෙන්කිරීම්",
    "nav.track": "පසුවිපරම්",
    "nav.profile": "පැතිකඩ",
    "nav.search": "සොයන්න",
    
    // Passenger
    "passenger.tab": "මගියා",
    "passenger.findBus": "ඔබේ බස් රථය සොයන්න",
    "passenger.from": "සිට",
    "passenger.to": "දක්වා",
    "passenger.date": "දිනය",
    "passenger.search": "බස් සොයන්න",
    
    // Footer
    "footer.copyright": "© 2023 SL බස්. සියලුම හිමිකම් ඇවිරිණි.",
  },
  
  // Tamil translations
  ta: {
    // General
    "app.name": "SL பஸ்",
    "app.tagline": "இலங்கை முழுவதும் பஸ்களை முன்பதிவு செய்து கண்காணிக்கவும்",
    
    // Auth
    "auth.login": "உள்நுழைக",
    "auth.register": "பதிவு செய்க",
    "auth.logout": "வெளியேறு",
    "auth.email": "மின்னஞ்சல்",
    "auth.username": "பயனர்பெயர்",
    "auth.password": "கடவுச்சொல்",
    
    // Navigation
    "nav.home": "முகப்பு",
    "nav.myBookings": "எனது முன்பதிவுகள்",
    "nav.track": "கண்காணி",
    "nav.profile": "சுயவிவரம்",
    "nav.search": "தேடல்",
    
    // Passenger
    "passenger.tab": "பயணி",
    "passenger.findBus": "உங்கள் பஸ்ஸைக் கண்டறியவும்",
    "passenger.from": "இருந்து",
    "passenger.to": "வரை",
    "passenger.date": "தேதி",
    "passenger.search": "பஸ்களைத் தேடுங்கள்",
    
    // Footer
    "footer.copyright": "© 2023 SL பஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
  }
};
