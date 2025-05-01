
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Clock } from 'lucide-react';
import AnimatedButton from '../ui-elements/AnimatedButton';
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Check login status from localStorage
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    // Clear login data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    
    setIsLoggedIn(false);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    navigate('/');
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md py-2 shadow-md" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-primary">
            EventPulse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === link.path ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/history">
                <AnimatedButton variant="outline" size="sm" className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>History</span>
                </AnimatedButton>
              </Link>
              <AnimatedButton onClick={handleLogout} variant="secondary" size="sm" className="flex items-center gap-2">
                <LogOut size={16} />
                <span>Logout</span>
              </AnimatedButton>
            </div>
          ) : (
            <Link to="/auth/login">
              <AnimatedButton>
                Login
              </AnimatedButton>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={cn(
                      "block py-2 text-lg font-medium transition-colors hover:text-primary",
                      location.pathname === link.path ? "text-primary" : "text-foreground/80"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {isLoggedIn ? (
                <>
                  <li className="pt-2">
                    <Link to="/history" className="block">
                      <AnimatedButton variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Clock size={18} />
                        <span>History</span>
                      </AnimatedButton>
                    </Link>
                  </li>
                  <li className="pt-2">
                    <AnimatedButton 
                      onClick={handleLogout} 
                      variant="secondary" 
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </AnimatedButton>
                  </li>
                </>
              ) : (
                <li className="pt-2">
                  <Link to="/auth/login">
                    <AnimatedButton className="w-full">
                      Login
                    </AnimatedButton>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
