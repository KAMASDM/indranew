// Enhanced src/components/BackToTop.js
'use client';
import { useState, useEffect, useCallback } from 'react';

const BackToTop = ({ 
  showAt = 300,
  variant = 'default',
  position = 'bottom-right',
  showProgress = true,
  customIcon = null,
  size = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isClicked, setIsClicked] = useState(false);

  // Calculate scroll progress
  const updateScrollProgress = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    setScrollProgress(scrollPercent);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      setIsVisible(scrolled > showAt);
      updateScrollProgress();
    };

    const handleScroll = () => {
      toggleVisibility();
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    toggleVisibility();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAt, updateScrollProgress]);

  const scrollToTop = useCallback(() => {
    setIsClicked(true);
    
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Reset click animation after scroll
    setTimeout(() => setIsClicked(false), 1000);

    // Track user interaction if analytics available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'scroll_to_top', {
        event_category: 'navigation',
        event_label: 'back_to_top_click'
      });
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Home' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        scrollToTop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToTop]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-center':
        return 'bottom-8 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-24 right-8';
      case 'top-left':
        return 'top-24 left-8';
      default:
        return 'bottom-8 right-8';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90';
      case 'colorful':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl';
      case 'outline':
        return 'bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white';
      case 'floating':
        return 'bg-white text-orange-500 shadow-2xl hover:shadow-3xl border border-gray-200';
      default:
        return 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl';
    }
  };

  const renderIcon = () => {
    if (customIcon) return customIcon;

    return (
      <svg 
        className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} transition-transform duration-300 ${
          isClicked ? 'transform -translate-y-1' : ''
        }`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Progress Ring (if enabled) */}
      {showProgress && variant !== 'minimal' && (
        <div className="absolute inset-0 -m-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300 opacity-20"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - scrollProgress)}`}
              className="text-orange-500 transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={scrollToTop}
        className={`
          ${getSizeClasses()} 
          ${getVariantClasses()}
          relative z-10 rounded-full 
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          transform hover:scale-110 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50
          group
          ${isClicked ? 'animate-pulse' : ''}
        `}
        aria-label="Scroll back to top"
        title="Back to top (Ctrl+Home)"
      >
        {/* Animated background for floating variant */}
        {variant === 'floating' && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        )}

        {/* Icon */}
        {renderIcon()}

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Back to top
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </button>

      {/* Progress Text (for minimal variant) */}
      {showProgress && variant === 'minimal' && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
          {Math.round(scrollProgress * 100)}%
        </div>
      )}
    </div>
  );
};

// Additional component for scroll progress bar at top of page
export const ScrollProgressBar = ({ height = 3, color = 'bg-orange-500' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 z-50 ${color} transition-all duration-300 ease-out`}
      style={{ 
        width: `${scrollProgress * 100}%`, 
        height: `${height}px` 
      }}
    />
  );
};

// Floating Action Menu component (additional feature)
export const FloatingActionMenu = ({ 
  position = 'bottom-right',
  items = [],
  mainButton = { icon: '⚡', label: 'Quick Actions' }
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-center':
        return 'bottom-8 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-8 right-8';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Menu Items */}
      <div className={`flex flex-col space-y-3 mb-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`
              w-12 h-12 bg-white text-orange-500 rounded-full shadow-lg hover:shadow-xl
              flex items-center justify-center transition-all duration-300
              transform hover:scale-110 border border-gray-200
              ${isOpen ? 'animate-slideInUp' : ''}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
            title={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center transition-all duration-300
          transform hover:scale-110 ${isOpen ? 'rotate-45' : ''}
        `}
        title={mainButton.label}
      >
        {mainButton.icon}
      </button>
    </div>
  );
};

export default BackToTop;