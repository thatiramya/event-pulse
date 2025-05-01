
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import BackgroundEffects from "./BackgroundEffects";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundEffects />
      <Navbar />
      <motion.main 
        className="flex-grow pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <footer className="bg-background/30 backdrop-blur-sm py-8 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-primary">
                EventPulse
              </span>
              <p className="text-sm text-foreground/60 mt-1">
                Book events in real-time, hassle-free.
              </p>
            </div>
            <div className="text-sm text-foreground/60">
              © {new Date().getFullYear()} EventPulse. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
