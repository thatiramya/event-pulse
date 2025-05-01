
import { useEffect, useRef } from 'react';

const BackgroundEffects = () => {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!starsContainerRef.current) return;
    
    // Create stars dynamically
    const container = starsContainerRef.current;
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Clear any existing stars
    container.innerHTML = '';
    
    // Create 150 stars with random properties
    for (let i = 0; i < 150; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random size between 1-3px
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * containerWidth}px`;
      star.style.top = `${Math.random() * containerHeight}px`;
      
      // Random twinkle animation duration (3-8s)
      const duration = Math.random() * 5 + 3;
      star.style.animationDuration = `${duration}s`;
      
      // Random delay
      const delay = Math.random() * 8;
      star.style.animationDelay = `${delay}s`;
      
      container.appendChild(star);
    }
    
    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Update star positions on resize
      const stars = container.querySelectorAll('.star');
      stars.forEach(star => {
        (star as HTMLElement).style.left = `${Math.random() * newWidth}px`;
        (star as HTMLElement).style.top = `${Math.random() * newHeight}px`;
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <>
      <div className="stars" ref={starsContainerRef}></div>
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
    </>
  );
};

export default BackgroundEffects;
