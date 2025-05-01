
import { Calendar, Clock, MapPin } from "lucide-react";
import GlassCard from "../ui-elements/GlassCard";
import Badge from "../ui-elements/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  availableSeats: number;
  totalSeats: number;
}

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard = ({ event, className }: EventCardProps) => {
  const availability = (event.availableSeats / event.totalSeats) * 100;
  
  let availabilityColor = "bg-green-500";
  if (availability < 30) {
    availabilityColor = "bg-red-500";
  } else if (availability < 70) {
    availabilityColor = "bg-amber-500";
  }

  return (
    <Link to={`/events/${event.id}`}>
      <GlassCard className={cn("h-full card-hover", className)}>
        <div className="relative">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <Badge 
            className="absolute top-2 right-2"
            variant="default"
          >
            {event.category}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
        
        <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex flex-col gap-2 text-sm text-foreground/80 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
          <span className="font-bold text-lg">
            ₹{event.price.toLocaleString()}
          </span>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-foreground/70 mb-1">
              {event.availableSeats} seats left
            </span>
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${availabilityColor} rounded-full`}
                style={{ width: `${availability}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};

export default EventCard;
