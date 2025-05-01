
import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../ui-elements/GlassCard";

interface ChatSupportProps {
  onClose: () => void;
  eventTitle?: string;
}

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

// Pre-defined responses for common questions
const predefinedResponses = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with regarding our events?",
    "Welcome to EventPulse support! How may I help you?"
  ],
  ticketRefund: [
    "Our refund policy allows refunds up to 7 days before the event. You can request a refund from your account dashboard under 'My Bookings'.",
    "You can cancel your booking and request a refund up to 7 days before the event. Please go to 'My Bookings' in your account to process this."
  ],
  ticketTransfer: [
    "Yes, you can transfer your ticket to someone else. Go to 'My Bookings' in your account, select the booking, and use the 'Transfer Ticket' option.",
    "Ticket transfers are allowed. Simply go to your account, find the booking, and use the transfer option to send it to another email address."
  ],
  eventTimings: [
    "Event timings are displayed on the event detail page. We recommend arriving 30 minutes early to avoid any last-minute rush.",
    "You can find the exact timings on the event page. The venue typically opens 1 hour before the event starts."
  ],
  parking: [
    "Most venues have parking facilities, but they might be limited. We recommend using public transport or ride-sharing services if possible.",
    "Parking information is specific to each venue. Please check the 'Venue Info' tab on the event page for parking details."
  ],
  foodDrinks: [
    "Food and drinks policies vary by venue. Most venues have their own food courts, but outside food is generally not allowed.",
    "Each venue has different policies. Usually, there are food and beverage options available at the venue, but bringing outside items may be restricted."
  ],
  dressCode: [
    "There's no specific dress code for most events, but we recommend checking the event details for any special requirements.",
    "Most events don't have strict dress codes, but formal events might require appropriate attire. Please check the event description."
  ],
  accessibility: [
    "All our venues provide accessibility features including wheelchair access, accessible seating, and facilities. You can request special assistance during booking.",
    "Our venues are accessible to all. If you require any specific accommodations, please mention it during booking or contact our support team."
  ],
  howToUse: [
    "To use EventPulse, start by browsing events on the home page. Click on an event to see details, then select 'Book Tickets' to reserve your seats. After payment, you'll receive an e-ticket via email.",
    "Our website is easy to use! Browse events by category, use filters to find exactly what you want, click on any event for more details, and book your tickets with just a few clicks."
  ],
  bookingProcess: [
    "To book tickets: 1) Find an event you like 2) Click 'Book Tickets' 3) Select your seats 4) Complete payment 5) Receive confirmation email with e-tickets",
    "Booking is simple: select your event, choose your seats, make the payment, and you'll get your tickets instantly via email."
  ],
  viewBookings: [
    "You can view all your bookings by clicking on 'History' in the top navigation bar after logging in. This will show all your past and upcoming bookings.",
    "After logging in, click on 'History' in the navigation menu to see all your confirmed bookings."
  ],
  filterEvents: [
    "You can filter events by category, date, and price range using the filter options on the Events page. Just select your preferences and click 'Apply Filters'.",
    "To find specific events, use the filters on the Events page. You can filter by category, date range, and price to narrow down your options."
  ],
  shareEvent: [
    "To share an event, visit the event page and click the 'Share' button. This will copy a link that you can send to friends or post on social media.",
    "You can share events by clicking the Share button on any event page. The link will be copied to your clipboard, ready to share."
  ],
  fallback: [
    "I don't have specific information about that, but our customer service team can help. Please email support@eventpulse.com or call +1-800-EVENT-HELP during business hours.",
    "For more detailed information on this, please contact our support team at support@eventpulse.com.",
    "I don't have that information at hand. For the most accurate response, please reach out to our customer support team."
  ]
};

const getRandomResponse = (category: keyof typeof predefinedResponses) => {
  const responses = predefinedResponses[category] || predefinedResponses.fallback;
  return responses[Math.floor(Math.random() * responses.length)];
};

const processBotResponse = (userMessage: string, eventTitle?: string): string => {
  const message = userMessage.toLowerCase();
  
  // Detect intent from user message
  if (/^(hi|hello|hey|greetings)/i.test(message)) {
    return getRandomResponse("greeting");
  }
  else if (/refund|cancel|money back/i.test(message)) {
    return getRandomResponse("ticketRefund");
  }
  else if (/transfer|give.+to.+friend|send.+ticket/i.test(message)) {
    return getRandomResponse("ticketTransfer");
  }
  else if (/time|when|hours|start|begin|opens/i.test(message)) {
    return getRandomResponse("eventTimings");
  }
  else if (/parking|car|vehicle|park/i.test(message)) {
    return getRandomResponse("parking");
  }
  else if (/food|drink|eat|snack|restaurant/i.test(message)) {
    return getRandomResponse("foodDrinks");
  }
  else if (/wear|dress|clothes|attire|outfit/i.test(message)) {
    return getRandomResponse("dressCode");
  }
  else if (/wheelchair|accessibility|disabled|special needs/i.test(message)) {
    return getRandomResponse("accessibility");
  }
  else if (/how.+(use|navigate|website|work|browse)/i.test(message)) {
    return getRandomResponse("howToUse");
  }
  else if (/book|purchase|buy|ticket|reserve/i.test(message)) {
    return getRandomResponse("bookingProcess");
  }
  else if (/view.+(booking|order|ticket|purchase)/i.test(message) || /history|past.+booking/i.test(message)) {
    return getRandomResponse("viewBookings");
  }
  else if (/filter|search|find|category|price/i.test(message)) {
    return getRandomResponse("filterEvents");
  }
  else if (/share|send|link|friend/i.test(message)) {
    return getRandomResponse("shareEvent");
  }
  else if (eventTitle && message.includes(eventTitle.toLowerCase())) {
    return `For specific information about ${eventTitle}, please check the event details page. If you have any specific questions about this event, I'd be happy to help!`;
  }
  else {
    return getRandomResponse("fallback");
  }
};

const ChatSupport = ({ onClose, eventTitle }: ChatSupportProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! How can I help you with EventPulse today? Ask me about booking tickets, finding events, or how to use the website!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Simulate bot thinking
    setIsTyping(true);
    setTimeout(() => {
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: processBotResponse(inputMessage, eventTitle),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay for more natural feel
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50 w-full max-w-md"
    >
      <GlassCard className="shadow-lg overflow-hidden flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
          <div>
            <h3 className="font-bold">EventPulse Support</h3>
            <p className="text-xs text-foreground/70">We typically reply in a few seconds</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 bg-secondary/40 hover:bg-secondary/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-primary/20 text-white"
                      : "bg-secondary/40"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-secondary/40 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-secondary/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`p-2 rounded-lg ${
                !inputMessage.trim() || isTyping
                  ? "bg-secondary/30 text-foreground/40"
                  : "bg-primary text-white"
              } transition-colors`}
            >
              {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ChatSupport;
