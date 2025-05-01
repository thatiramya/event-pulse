
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import FeaturedEvent from "../events/FeaturedEvent";
import { mockEvents } from "../../data/mockData";

const FeaturedEvents = () => {
  // Use the first event as the featured one
  const featuredEvent = mockEvents[0];
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="section-title">Featured Event</h2>
          
          <Link to="/events" className="flex items-center gap-1 text-primary hover:underline">
            View All
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <FeaturedEvent event={featuredEvent} />
      </div>
    </section>
  );
};

export default FeaturedEvents;
