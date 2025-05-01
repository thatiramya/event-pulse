
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "className" | "children" | "whileHover" | "whileTap"> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

const AnimatedButton = ({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  ...props 
}: AnimatedButtonProps) => {
  
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: "bg-gradient-primary text-white shadow-md hover:shadow-lg hover:shadow-primary/20",
    secondary: "bg-secondary/70 text-white border border-secondary/90 hover:bg-secondary/90",
    outline: "bg-transparent border border-primary/50 text-primary hover:bg-primary/10"
  };

  return (
    <motion.button
      className={cn(
        "rounded-full font-medium transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
