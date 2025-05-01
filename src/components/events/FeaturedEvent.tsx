
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import GlassCard from "../ui-elements/GlassCard";
import AnimatedButton from "../ui-elements/AnimatedButton";
import { Event } from "./EventCard";
import { Link } from "react-router-dom";

interface FeaturedEventProps {
  event: Event;
}

const FeaturedEvent = ({ event }: FeaturedEventProps) => {
  return (
    <GlassCard className="md:flex gap-6 overflow-hidden">
      <div className="md:w-2/5 mb-4 md:mb-0">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-64 md:h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="md:w-3/5 flex flex-col">
        <div className="mb-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-block px-2.5 py-0.5 bg-primary/20 text-primary/90 rounded-full text-xs font-medium">
              Featured
            </span>
            <span className="inline-block px-2.5 py-0.5 bg-secondary/70 text-white rounded-full text-xs font-medium">
              {event.category}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {event.title}
          </h2>
          
          <p className="text-foreground/70 mb-4">
            {event.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-foreground/80">
              <Calendar size={18} className="text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Clock size={18} className="text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <MapPin size={18} className="text-primary" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Users size={18} className="text-primary" />
              <span>{event.availableSeats} seats available</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <span className="block text-sm text-foreground/70">Price per ticket</span>
            <span className="text-2xl font-bold">₹{event.price.toLocaleString()}</span>
          </div>
          
          <Link to={`/events/${event.id}`}>
            <AnimatedButton className="group flex items-center gap-2">
              Book Now
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
};

export default FeaturedEvent;
