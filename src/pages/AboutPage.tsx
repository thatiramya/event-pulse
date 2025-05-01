
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import GlassCard from "../components/ui-elements/GlassCard";
import { Users, Calendar, Award, Map, Mail, Phone } from "lucide-react";

const AboutPage = () => {
  return (
    <Layout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-primary">About EventPulse</h1>
          
          <GlassCard className="mb-10 p-8">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-foreground/80 mb-6">
              EventPulse was founded in 2023 with a simple mission: to make event discovery and 
              booking a seamless, enjoyable experience. What started as a small project has 
              grown into a platform that connects thousands of event enthusiasts with their 
              perfect experiences.
            </p>
            <p className="text-foreground/80">
              Our team is made up of passionate individuals who love bringing people together 
              through memorable events. We believe that the right event can create lasting memories 
              and meaningful connections.
            </p>
          </GlassCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <GlassCard className="p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Our Community</h3>
              <p className="text-foreground/80">
                A thriving community of event organizers and attendees, all united by their passion for extraordinary experiences.
              </p>
            </GlassCard>
            
            <GlassCard className="p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <Calendar className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Event Variety</h3>
              <p className="text-foreground/80">
                From intimate workshops to grand concerts, we showcase a diverse range of events to suit all interests.
              </p>
            </GlassCard>
            
            <GlassCard className="p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <Award className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Quality Assurance</h3>
              <p className="text-foreground/80">
                Every event on our platform undergoes a quality check to ensure the best experience for our users.
              </p>
            </GlassCard>
            
            <GlassCard className="p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <Map className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Reach</h3>
              <p className="text-foreground/80">
                With events across multiple cities and countries, we're bringing people together worldwide.
              </p>
            </GlassCard>
          </div>
          
          <GlassCard className="p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: "Alex Johnson", role: "Founder & CEO" },
                { name: "Sarah Chen", role: "Head of Operations" },
                { name: "Michael Rodriguez", role: "Lead Developer" },
                { name: "Priya Patel", role: "UX Designer" },
                { name: "David Kim", role: "Marketing Director" },
                { name: "Emma Wilson", role: "Customer Support Lead" }
              ].map((member, index) => (
                <div 
                  key={index} 
                  className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-foreground/70 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-foreground/80 mb-6">
              At EventPulse, we're dedicated to revolutionizing how people discover, book, and experience events. 
              We believe that everyone should have access to enriching experiences that inspire, educate, and entertain.
            </p>
            <p className="text-foreground/80">
              Through innovative technology and a user-centric approach, we're making it easier than ever to 
              connect with the events that matter to you, while helping event organizers reach their perfect audience.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutPage;
