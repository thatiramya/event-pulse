
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import EventsPage from "./pages/EventsPage";
import EventDetail from "./pages/EventDetail";
import BookingPage from "./pages/BookingPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFound from "./pages/NotFound";
import BookingHistory from "./pages/BookingHistory";
import ChatSupportButton from "./components/support/ChatSupportButton";

const queryClient = new QueryClient();

const App = () => {
  // Clear login status on initial app load to ensure user is not automatically logged in
  useEffect(() => {
    // Check if this is the first load of the application
    const isFirstLoad = sessionStorage.getItem("appLoaded") !== "true";
    
    if (isFirstLoad) {
      // On first load of the app, clear the login status
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      
      // Mark that the app has been loaded
      sessionStorage.setItem("appLoaded", "true");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/:id/booking" element={<BookingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/history" element={<BookingHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <ChatSupportButton />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
