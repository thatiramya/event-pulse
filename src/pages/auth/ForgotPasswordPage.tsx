
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import AnimatedButton from "@/components/ui-elements/AnimatedButton";
import GlassCard from "@/components/ui-elements/GlassCard";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";

const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Please enter a valid email address." })
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      // This would be replaced with an actual API call
      // console.log("Reset password for:", data.email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      
      toast({
        title: "Reset Link Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "There was an error sending the reset link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-[25%] w-[50%] h-[40%] rounded-full blur-[120px] bg-purple-700/20"></div>
        <div className="absolute bottom-0 right-[25%] w-[50%] h-[40%] rounded-full blur-[120px] bg-blue-700/20"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex justify-center mb-8">
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-primary">
            EventPulse
          </span>
        </Link>
        
        <GlassCard className="p-8">
          {!emailSent ? (
            <>
              <h1 className="text-2xl font-bold mb-2 text-center">Reset Your Password</h1>
              <p className="text-center text-foreground/70 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            autoComplete="email"
                            className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <AnimatedButton
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? "Sending..." : "Send Reset Link"}
                      {!isSubmitting && <Send size={18} />}
                    </span>
                  </AnimatedButton>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Email Sent</h1>
              <p className="text-foreground/70 mb-6">
                We've sent a password reset link to your email. Please check your inbox and follow the instructions.
              </p>
              <p className="text-sm text-foreground/50 mb-6">
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/auth/login" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft size={16} className="mr-1" />
              Back to login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
