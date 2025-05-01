
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const GlassCard = ({ children, className, animate = false }: GlassCardProps) => {
  const baseClasses = cn(
    "glass rounded-xl p-6 transition-all duration-300", 
    "backdrop-blur-lg bg-white/5 border border-white/10",
    "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
    "hover:shadow-[0_8px_30px_rgba(80,60,240,0.12)]",
    className
  );
  
  if (animate) {
    return (
      <motion.div 
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    );
  }
  
  return <div className={baseClasses}>{children}</div>;
};

export default GlassCard;
