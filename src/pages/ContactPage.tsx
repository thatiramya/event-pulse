
import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/layout/Layout";
import GlassCard from "../components/ui-elements/GlassCard";
import AnimatedButton from "../components/ui-elements/AnimatedButton";
import { MapPin, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      
      form.reset();
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-primary">Get in Touch</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <GlassCard className="mb-6 p-6">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Office Address</h3>
                      <p className="text-foreground/70">
                        123 Event Street, Pulse City<br />
                        Tech Valley, 100001
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <p className="text-foreground/70">
                        info@eventpulse.com<br />
                        support@eventpulse.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <p className="text-foreground/70">
                        +1 (555) 123-4567<br />
                        +1 (555) 765-4321
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Customer Support</h3>
                      <p className="text-foreground/70">
                        Available 24/7<br />
                        Live chat on our website
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-4">Connect With Us</h2>
                <p className="text-foreground/70 mb-4">
                  Follow us on social media for the latest updates, event highlights, and promotions.
                </p>
                
                <div className="flex gap-4 justify-center">
                  {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                    <a
                      key={social}
                      href={`https://${social}.com/eventpulse`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5 text-foreground">{/* Icon */}</div>
                    </a>
                  ))}
                </div>
              </GlassCard>
            </div>
            
            <div className="lg:col-span-2">
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                {...field} 
                                className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your email" 
                                type="email" 
                                {...field} 
                                className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Message subject" 
                              {...field} 
                              className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Your message" 
                              {...field}
                              rows={6}
                              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <AnimatedButton 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        <Send size={18} />
                      </AnimatedButton>
                    </div>
                  </form>
                </Form>
              </GlassCard>
            </div>
          </div>
          
          <GlassCard className="mt-10 p-6">
            <h2 className="text-2xl font-bold mb-4">Find Us</h2>
            <div className="h-[400px] bg-white/5 rounded-lg flex items-center justify-center">
              {/* This would be replaced with an actual map component or embedded map */}
              <p className="text-foreground/50">Interactive Map would be displayed here</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ContactPage;
