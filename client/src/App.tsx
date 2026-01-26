import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import TourDetail from "./pages/TourDetail";
import TourDetailSipin from "./pages/TourDetailSipin";
import TourDetailSipinTest from "./pages/TourDetailSipinTest";
import BookTour from "./pages/BookTour";
import BookingDetail from "./pages/BookingDetail";
import QuickInquiry from "./pages/QuickInquiry";
import CustomTourRequest from "./pages/CustomTourRequest";
import CustomTours from "./pages/CustomTours";
import VisaServices from "./pages/VisaServices";
import GroupPackages from "./pages/GroupPackages";
import FlightBooking from "./pages/FlightBooking";
import AirportTransfer from "./pages/AirportTransfer";
import HotelBooking from "./pages/HotelBooking";
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";
import SearchResults from "./pages/SearchResults";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search"} component={SearchResults} />
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/tours/:id"} component={TourDetailSipin} />
      <Route path={"/tours-sipin-test/:id"} component={TourDetailSipinTest} />
      <Route path={"/tours-sipin/:id"} component={TourDetailSipin} />
      <Route path={"/book/:id"} component={BookTour} />
      <Route path={"/bookings/:id"} component={BookingDetail} />
      <Route path={"/payment/success"} component={PaymentSuccess} />
      <Route path={"/payment/failure"} component={PaymentFailure} />
      <Route path={"/inquiry"} component={QuickInquiry} />
      <Route path={"/custom-tour-request"} component={CustomTourRequest} />
      <Route path={"/custom-tours"} component={CustomTours} />
      <Route path={"/visa-services"} component={VisaServices} />
      <Route path={"/group-packages"} component={GroupPackages} />
      <Route path={"/flight-booking"} component={FlightBooking} />
      <Route path={"/airport-transfer"} component={AirportTransfer} />
      <Route path={"/hotel-booking"} component={HotelBooking} />
      <Route path={"/about-us"} component={AboutUs} />
      <Route path={"/terms-of-service"} component={TermsOfService} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/contact-us"} component={ContactUs} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
