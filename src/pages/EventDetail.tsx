
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import GlassCard from "../components/ui-elements/GlassCard";
import AnimatedButton from "../components/ui-elements/AnimatedButton";
import { Calendar, Clock, MapPin, Users, ArrowLeft, Share2, Info, Copy, CheckCircle2 } from "lucide-react";
import { mockEvents } from "../data/mockData";
import { Event } from "../components/events/EventCard";
import { motion } from "framer-motion";
import ChatSupport from "../components/support/ChatSupport";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("details");
  const [showChatbot, setShowChatbot] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    // Simulate API request
    const timer = setTimeout(() => {
      const foundEvent = mockEvents.find(e => e.id === id) || null;
      setEvent(foundEvent);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleShareEvent = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
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
            <Info size={48} className="mx-auto mb-4 text-foreground/40" />
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
        {/* Back Button */}
        <Link to="/events" className="inline-flex items-center gap-2 mb-6 text-foreground/80 hover:text-primary transition-colors">
          <ArrowLeft size={18} />
          <span>Back to events</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative rounded-xl overflow-hidden mb-8">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-[40vh] object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 flex items-end p-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block px-2.5 py-0.5 bg-primary/20 text-primary/90 rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-secondary/70 text-white rounded-full text-xs font-medium">
                      {event.availableSeats} seats left
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
                </div>
              </div>
            </div>
            
            {/* Event Information */}
            <GlassCard className="mb-8">
              <div className="flex border-b border-white/10 mb-6">
                <button
                  className={`py-3 px-4 font-medium text-sm transition-colors ${selectedTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-foreground/70 hover:text-foreground'}`}
                  onClick={() => setSelectedTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-3 px-4 font-medium text-sm transition-colors ${selectedTab === 'venue' ? 'text-primary border-b-2 border-primary' : 'text-foreground/70 hover:text-foreground'}`}
                  onClick={() => setSelectedTab('venue')}
                >
                  Venue Info
                </button>
                <button
                  className={`py-3 px-4 font-medium text-sm transition-colors ${selectedTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-foreground/70 hover:text-foreground'}`}
                  onClick={() => setSelectedTab('reviews')}
                >
                  Reviews
                </button>
              </div>
              
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {selectedTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">About This Event</h3>
                    <p className="text-foreground/80 mb-6">
                      {event.description}
                      <br /><br />
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis vel ipsum aliquet lobortis. 
                      Vivamus euismod, nisi vel tincidunt lacinia, nisl est aliquam nunc, vitae aliquet nunc nisl vitae nunc. 
                      Sed euismod, nisi vel tincidunt lacinia, nisl est aliquam nunc, vitae aliquet nunc nisl vitae nunc.
                      <br /><br />
                      Donec magna purus, mattis vel tincidunt dignissim, semper quis nisl. Ut id hendrerit urna. 
                      Ut tempus, ligula a lobortis dapibus, arcu felis placerat urna, id congue velit ipsum a purus.
                    </p>
                    
                    <h3 className="text-xl font-bold mb-4">What's Included</h3>
                    <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-6">
                      <li>Entry to the event</li>
                      <li>Reserved seating</li>
                      <li>Complimentary refreshments</li>
                      <li>Event memorabilia</li>
                    </ul>
                    
                    <h3 className="text-xl font-bold mb-4">Additional Information</h3>
                    <div className="text-foreground/80">
                      <p className="mb-2">
                        <strong>Duration:</strong> 3 hours
                      </p>
                      <p className="mb-2">
                        <strong>Age Restrictions:</strong> 18+ only
                      </p>
                      <p>
                        <strong>Cancellation Policy:</strong> Refundable up to 7 days before the event
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedTab === 'venue' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Venue Details</h3>
                    <div className="bg-black/20 h-64 rounded-lg mb-6">
                      {/* Map placeholder - would be replaced with actual map */}
                      <div className="h-full flex items-center justify-center text-foreground/50">
                        Interactive Map would be displayed here
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">{event.location}</h4>
                    <p className="text-foreground/80 mb-6">
                      123 Example Street, City, State, 400001
                      <br />
                      Landmark: Near Central Park
                    </p>
                    
                    <h3 className="text-xl font-bold mb-4">How to Reach</h3>
                    <div className="space-y-4 text-foreground/80">
                      <div>
                        <h4 className="font-semibold mb-1">By Public Transport</h4>
                        <p>Take Metro Line 1 to Central Station, then walk for 5 minutes towards the venue.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">By Car</h4>
                        <p>Limited parking is available at the venue. We recommend using ride-sharing services.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                    <div className="space-y-6">
                      <div className="border-b border-white/10 pb-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">Amit Sharma</h4>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-primary' : 'text-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/50 mb-2">Attended on Oct 15, 2023</p>
                        <p className="text-foreground/80">
                          Amazing experience! The event was well organized and the performances were outstanding. 
                          Would definitely recommend to others.
                        </p>
                      </div>
                      
                      <div className="border-b border-white/10 pb-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">Priya Patel</h4>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < 5 ? 'text-primary' : 'text-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/50 mb-2">Attended on Sep 28, 2023</p>
                        <p className="text-foreground/80">
                          Perfect event from start to finish. The venue was beautiful and the organization was flawless. 
                          I'm looking forward to attending more events like this!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </GlassCard>
          </div>
          
          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GlassCard className="mb-6">
                <h3 className="text-xl font-bold mb-6">Event Information</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Date</h4>
                      <p className="text-foreground/70">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Time</h4>
                      <p className="text-foreground/70">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-foreground/70">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Availability</h4>
                      <p className="text-foreground/70">{event.availableSeats} out of {event.totalSeats} seats left</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold">Price per ticket</span>
                    <span className="text-2xl font-bold">₹{event.price.toLocaleString()}</span>
                  </div>
                  
                  <Link to={`/events/${event.id}/booking`}>
                    <AnimatedButton className="w-full mb-3">
                      Book Tickets
                    </AnimatedButton>
                  </Link>
                  
                  <button 
                    className="w-full flex justify-center items-center gap-2 py-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    onClick={handleShareEvent}
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle2 size={18} className="text-green-400" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={18} />
                        <span>Share Event</span>
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
              
              <GlassCard>
                <h3 className="text-lg font-bold mb-4">Need Help?</h3>
                <p className="text-foreground/70 mb-4">
                  Have questions about this event? Get in touch with our support team.
                </p>
                <button 
                  className="w-full py-2 px-4 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setShowChatbot(true)}
                >
                  Contact Support
                </button>
              </GlassCard>
            </div>
          </div>
        </div>
        
        {/* Chatbot */}
        {showChatbot && (
          <ChatSupport onClose={() => setShowChatbot(false)} eventTitle={event.title} />
        )}
      </div>
    </Layout>
  );
};

export default EventDetail;
