
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import GlassCard from "../components/ui-elements/GlassCard";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

type Seat = {
  id: string;
  row: string;
  number: number;
  category: string;
  price: number;
};

type Booking = {
  id: string;
  eventId: string;
  eventName: string;
  eventImage: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  seats: Seat[];
  totalPrice: number;
  bookingDate: string;
  status: "confirmed" | "cancelled" | "pending";
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/auth/login", { state: { from: "/history" } });
      return;
    }
    
    // Fetch bookings from backend
    // In a real implementation, this would be an API call to fetch user's bookings
    setLoading(true);
    
    // Mock data - In a real app, you would fetch from your API
    setTimeout(() => {
      const mockBookings: Booking[] = [
        {
          id: "b1",
          eventId: "1",
          eventName: "Coldplay: Music of the Spheres World Tour",
          eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
          eventDate: "May 15, 2025",
          eventTime: "7:00 PM",
          eventLocation: "DY Patil Stadium, Mumbai",
          seats: [
            { id: "s1", row: "A", number: 12, category: "Premium", price: 1800 },
            { id: "s2", row: "A", number: 13, category: "Premium", price: 1800 }
          ],
          totalPrice: 3600, // 2 seats at 1800 each
          bookingDate: "April 2, 2025",
          status: "confirmed"
        },
        {
          id: "b2",
          eventId: "8", 
          eventName: "Ballet: Swan Lake",
          eventImage: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
          eventDate: "November 5, 2025",
          eventTime: "7:00 PM",
          eventLocation: "Royal Opera House, Mumbai",
          seats: [
            { id: "s3", row: "C", number: 5, category: "Standard", price: 1900 },
            { id: "s4", row: "C", number: 6, category: "Standard", price: 1900 },
            { id: "s5", row: "C", number: 7, category: "Standard", price: 1900 }
          ],
          totalPrice: 5700, // 3 seats at 1900 each
          bookingDate: "May 25, 2025",
          status: "confirmed"
        }
      ];
      
      setBookings(mockBookings);
      setLoading(false);
    }, 1500);
  }, [navigate]);

  const viewETicket = (booking: Booking) => {
    // In a real app, you would show the e-ticket
    toast({
      title: "E-Ticket Viewed",
      description: `Your e-ticket for ${booking.eventName} has been displayed.`,
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-primary">
            Your Booking History
          </h1>
          <p className="text-foreground/70 mt-2">
            View all your past and upcoming event bookings
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : bookings.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {bookings.map((booking) => (
              <motion.div key={booking.id} variants={item}>
                <GlassCard className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <div className="h-48 md:h-full relative">
                        <img 
                          src={booking.eventImage} 
                          alt={booking.eventName} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                            booking.status === "cancelled" ? "bg-red-500/20 text-red-400" : 
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-2/3">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-1">{booking.eventName}</h3>
                        <p className="text-sm text-foreground/70">
                          Booking ID: {booking.id}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Date</p>
                            <p className="text-sm text-foreground/70">{booking.eventDate}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Clock size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Time</p>
                            <p className="text-sm text-foreground/70">{booking.eventTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-sm text-foreground/70">{booking.eventLocation}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Ticket size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Seats</p>
                            <p className="text-sm text-foreground/70">
                              {booking.seats.map(seat => `${seat.row}${seat.number}`).join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-white/10">
                        <div className="mb-4 sm:mb-0">
                          <p className="text-sm text-foreground/70">Total Amount</p>
                          <p className="text-xl font-bold">₹{booking.totalPrice.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => viewETicket(booking)}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-primary/20 hover:bg-primary/30 transition-colors"
                          >
                            <Eye size={16} />
                            <span>View E-Ticket</span>
                          </button>
                          
                          <Link 
                            to={`/events/${booking.eventId}`}
                            className="px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                          >
                            View Event
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <GlassCard className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <Ticket size={48} className="mx-auto mb-4 text-foreground/40" />
              <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
              <p className="text-foreground/70 mb-6">
                You haven't made any bookings yet. Start exploring events and book your first event!
              </p>
              <Link to="/events">
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium">
                  Browse Events
                </button>
              </Link>
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
};

export default BookingHistory;
