import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import GlassCard from "../components/ui-elements/GlassCard";
import AnimatedButton from "../components/ui-elements/AnimatedButton";
import { Calendar, Clock, MapPin, Users, CreditCard, X, CheckCircle } from "lucide-react";
import { mockEvents } from "../data/mockData";
import { Event } from "../components/events/EventCard";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// Define types for seat selection
type SeatCategory = {
  id: string;
  name: string;
  price: number;
  available: number;
  total: number;
};

type Seat = {
  id: string;
  number: number;
  row: string;
  category: string;
  status: "available" | "selected" | "booked";
};

// Mock seat data
const seatCategories: SeatCategory[] = [
  { id: "premium", name: "Premium", price: 1500, available: 20, total: 30 },
  { id: "standard", name: "Standard", price: 800, available: 50, total: 80 },
  { id: "basic", name: "Basic", price: 500, available: 100, total: 150 }
];

// Generate seats for visualization
const generateSeats = (categoryId: string): Seat[] => {
  const category = seatCategories.find(c => c.id === categoryId);
  if (!category) return [];
  
  const seats: Seat[] = [];
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rowsNeeded = Math.ceil(category.total / 10);
  
  for (let r = 0; r < rowsNeeded; r++) {
    for (let s = 1; s <= 10; s++) {
      if (seats.length >= category.total) break;
      
      const seatId = `${categoryId}-${rowLabels[r]}${s}`;
      const isBooked = seats.length >= category.available;
      
      seats.push({
        id: seatId,
        number: s,
        row: rowLabels[r],
        category: categoryId,
        status: isBooked ? "booked" : "available" 
      });
    }
  }
  
  return seats;
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("premium");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth/login", { state: { from: `/events/${id}/booking` } });
      return;
    }

    const timer = setTimeout(() => {
      const foundEvent = mockEvents.find(e => e.id === id) || null;
      setEvent(foundEvent);
      setLoading(false);
      
      setSeats(generateSeats("premium"));
    }, 800);

    return () => clearTimeout(timer);
  }, [id, navigate, isLoggedIn]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSeats(generateSeats(categoryId));
    setSelectedSeats([]);
  };

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === "booked") return;
    
    const seatIndex = selectedSeats.findIndex(s => s.id === seat.id);
    
    if (seatIndex === -1) {
      if (selectedSeats.length < ticketQuantity) {
        setSelectedSeats([...selectedSeats, {...seat, status: "selected"}]);
        
        const updatedSeats = seats.map(s => 
          s.id === seat.id ? { ...s, status: "selected" as const } : s
        );
        setSeats(updatedSeats);
      } else {
        toast({
          title: "Selection limit reached",
          description: `You can only select ${ticketQuantity} seats. Adjust quantity if needed.`,
        });
      }
    } else {
      const newSelectedSeats = [...selectedSeats];
      newSelectedSeats.splice(seatIndex, 1);
      setSelectedSeats(newSelectedSeats);
      
      const updatedSeats = seats.map(s => 
        s.id === seat.id ? { ...s, status: "available" as const } : s
      );
      setSeats(updatedSeats);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < selectedSeats.length) {
      const keepSeats = selectedSeats.slice(0, newQuantity);
      const removeSeats = selectedSeats.slice(newQuantity);
      
      const updatedSeats = seats.map(s => {
        if (removeSeats.some(rs => rs.id === s.id)) {
          return { ...s, status: "available" as const };
        }
        return s;
      });
      
      setSeats(updatedSeats);
      setSelectedSeats(keepSeats);
    }
    
    setTicketQuantity(newQuantity);
  };

  const calculateTotal = () => {
    const category = seatCategories.find(c => c.id === selectedCategory);
    if (!category) return 0;
    return category.price * selectedSeats.length;
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const processPayment = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to proceed with booking.",
        variant: "destructive"
      });
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedBookingId = "EVP" + Math.floor(100000 + Math.random() * 900000);
      setBookingId(generatedBookingId);
      
      setBookingComplete(true);
      toast({
        title: "Booking Successful!",
        description: "Your tickets have been booked successfully.",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex justify-center items-center min-h-[60vh]">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="page-container">
          <GlassCard className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="text-foreground/70 mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/events">
              <AnimatedButton>
                Browse Events
              </AnimatedButton>
            </Link>
          </GlassCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <div className="flex justify-between max-w-xl mx-auto">
            {["Select Seats", "Your Details", "Payment"].map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${index + 1 === currentStep ? "text-primary" : index + 1 < currentStep ? "text-foreground/70" : "text-foreground/40"}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    index + 1 === currentStep 
                      ? "bg-primary text-white" 
                      : index + 1 < currentStep 
                        ? "bg-primary/20 text-primary" 
                        : "bg-foreground/10 text-foreground/40"
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm hidden md:block">{step}</span>
              </div>
            ))}
          </div>
          <div className="flex max-w-xl mx-auto mt-2">
            <div className={`h-1 flex-1 ${currentStep > 1 ? "bg-primary" : "bg-foreground/10"}`}></div>
            <div className={`h-1 flex-1 ${currentStep > 2 ? "bg-primary" : "bg-foreground/10"}`}></div>
          </div>
        </div>
        
        {bookingComplete ? (
          <GlassCard className="max-w-2xl mx-auto p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500/20 text-green-500 mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-foreground/70 mb-4">
              Thank you for your booking. Your tickets have been confirmed and details have been sent to your email.
            </p>
            <div className="my-6 py-4 px-6 bg-white/5 rounded-lg inline-block">
              <h3 className="font-semibold mb-1">Booking Reference</h3>
              <p className="text-2xl font-mono font-bold text-primary">{bookingId}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Event Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Event:</span> {event.title}</p>
                <p><span className="font-medium">Date:</span> {event.date}, {event.time}</p>
                <p><span className="font-medium">Venue:</span> {event.location}</p>
                <p>
                  <span className="font-medium">Seats:</span>{" "}
                  {selectedSeats.map(seat => `${seat.row}${seat.number}`).join(", ")}
                </p>
                <p><span className="font-medium">Total Paid:</span> ₹{calculateTotal().toLocaleString()}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <AnimatedButton>
                  View My Bookings
                </AnimatedButton>
              </Link>
              <Link to="/events">
                <AnimatedButton variant="outline">
                  Explore More Events
                </AnimatedButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Select Your Seats</h2>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground/70 text-sm">Ticket Quantity:</span>
                        <div className="flex items-center">
                          <button 
                            className="w-8 h-8 rounded-l-md bg-white/10 flex items-center justify-center disabled:opacity-50"
                            onClick={() => handleQuantityChange(Math.max(1, ticketQuantity - 1))}
                            disabled={ticketQuantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center bg-white/5">
                            {ticketQuantity}
                          </span>
                          <button 
                            className="w-8 h-8 rounded-r-md bg-white/10 flex items-center justify-center disabled:opacity-50"
                            onClick={() => handleQuantityChange(Math.min(10, ticketQuantity + 1))}
                            disabled={ticketQuantity >= 10}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {seatCategories.map(category => (
                        <button
                          key={category.id}
                          className={`p-4 rounded-lg border ${
                            selectedCategory === category.id
                              ? "border-primary bg-primary/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          } transition-colors`}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          <h3 className="font-semibold mb-1">{category.name}</h3>
                          <p className="text-foreground/70 text-sm">
                            ₹{category.price.toLocaleString()} per seat
                          </p>
                          <p className={`text-sm mt-1 ${
                            category.available < 10 ? "text-orange-400" : "text-green-400"
                          }`}>
                            {category.available} available
                          </p>
                        </button>
                      ))}
                    </div>
                    
                    <div className="mb-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-3/4 h-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-lg flex items-center justify-center text-foreground/70 text-sm">
                          STAGE
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto">
                        {seats.map(seat => (
                          <button
                            key={seat.id}
                            className={`w-full aspect-square rounded-md flex items-center justify-center text-xs transition-all ${
                              seat.status === "booked"
                                ? "bg-foreground/20 text-foreground/40 cursor-not-allowed"
                                : seat.status === "selected"
                                  ? "bg-primary text-white shadow-md hover:bg-primary/90"
                                  : "bg-white/10 hover:bg-white/20"
                            }`}
                            onClick={() => toggleSeatSelection(seat)}
                            disabled={seat.status === "booked"}
                          >
                            {seat.row}{seat.number}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-white/10 rounded-sm"></div>
                          <span className="text-sm text-foreground/70">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-primary rounded-sm"></div>
                          <span className="text-sm text-foreground/70">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-foreground/20 rounded-sm"></div>
                          <span className="text-sm text-foreground/70">Booked</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <AnimatedButton
                        onClick={() => setCurrentStep(2)}
                        disabled={selectedSeats.length === 0}
                      >
                        {selectedSeats.length === 0 ? "Select at least one seat" : "Continue to Details"}
                      </AnimatedButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
              
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">Your Details</h2>
                    
                    <div className="space-y-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          name="name"
                          value={customerInfo.name}
                          onChange={handleInfoChange}
                          placeholder="Enter your full name"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                          name="email"
                          value={customerInfo.email}
                          onChange={handleInfoChange}
                          placeholder="Enter your email"
                          type="email"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          name="phone"
                          value={customerInfo.phone}
                          onChange={handleInfoChange}
                          placeholder="Enter your phone number"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back to Seats
                      </AnimatedButton>
                      
                      <AnimatedButton
                        onClick={() => setCurrentStep(3)}
                        disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
                      >
                        Continue to Payment
                      </AnimatedButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
              
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard className="mb-8">
                    <h2 className="text-2xl font-bold mb-6">Payment</h2>
                    
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                      <h3 className="font-semibold mb-4">Order Summary</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span>{event.title}</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-foreground/70 text-sm">
                          <span>{selectedSeats.length} × {seatCategories.find(c => c.id === selectedCategory)?.name} Seats</span>
                          <span>₹{(seatCategories.find(c => c.id === selectedCategory)?.price || 0).toLocaleString()} each</span>
                        </div>
                        <div className="flex justify-between text-foreground/70 text-sm">
                          <span>Booking Fee</span>
                          <span>₹0</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6 mb-8">
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date</label>
                          <Input
                            placeholder="MM/YY"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">CVV</label>
                          <Input
                            placeholder="123"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                        <Input
                          placeholder="Name on card"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <AnimatedButton
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        Back
                      </AnimatedButton>
                      
                      <AnimatedButton
                        onClick={processPayment}
                        disabled={paymentProcessing}
                        className="min-w-[150px]"
                      >
                        {paymentProcessing ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Pay ₹{calculateTotal().toLocaleString()}
                            <CreditCard size={18} />
                          </span>
                        )}
                      </AnimatedButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GlassCard className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Event Details</h2>
                    <Link to={`/events/${event.id}`} className="text-foreground/70 hover:text-primary">
                      <X size={18} />
                    </Link>
                  </div>
                  
                  <div className="mb-4">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-bold mb-1">{event.title}</h3>
                    <p className="text-foreground/70 text-sm">
                      {event.category}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Date</h4>
                        <p className="text-foreground/70 text-sm">{event.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Time</h4>
                        <p className="text-foreground/70 text-sm">{event.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Location</h4>
                        <p className="text-foreground/70 text-sm">{event.location}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
                
                {selectedSeats.length > 0 && (
                  <GlassCard>
                    <h2 className="text-xl font-bold mb-4">Selected Seats</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedSeats.map(seat => (
                        <div 
                          key={seat.id} 
                          className="px-2 py-1 rounded bg-primary/20 flex items-center gap-1"
                        >
                          <span>{seat.row}{seat.number}</span>
                          <button 
                            className="text-foreground/70 hover:text-foreground"
                            onClick={() => toggleSeatSelection(seat)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between mb-2">
                        <span className="text-foreground/70">
                          {selectedSeats.length} × {seatCategories.find(c => c.id === selectedCategory)?.name}
                        </span>
                        <span>
                          ₹{((seatCategories.find(c => c.id === selectedCategory)?.price || 0) * selectedSeats.length).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingPage;

