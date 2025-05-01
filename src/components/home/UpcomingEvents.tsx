
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "../events/EventCard";
import { mockEvents } from "../../data/mockData";
import { motion } from "framer-motion";

const UpcomingEvents = () => {
  // Use a subset of events
  const upcomingEvents = mockEvents.slice(1, 5);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="section-title">Upcoming Events</h2>
          
          <Link to="/events" className="flex items-center gap-1 text-primary hover:underline">
            View All
            <ChevronRight size={16} />
          </Link>
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {upcomingEvents.map((event) => (
            <motion.div key={event.id} variants={item}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
