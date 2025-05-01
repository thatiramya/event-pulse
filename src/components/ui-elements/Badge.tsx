
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

const Badge = ({ 
  children, 
  variant = "default", 
  className 
}: BadgeProps) => {
  
  const variantClasses = {
    default: "bg-primary/90 text-white",
    outline: "bg-transparent border border-primary text-primary",
    secondary: "bg-secondary/80 text-white"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
