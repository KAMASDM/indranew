// Enhanced src/components/LoadingSpinner.js
'use client';
import { useEffect, useState } from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'orange', 
  variant = 'default',
  text = null,
  fullScreen = false,
  overlay = false,
  speed = 'normal'
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24'
  };

  const colorClasses = {
    orange: {
      primary: 'text-orange-500',
      secondary: 'text-orange-300',
      gradient: 'from-orange-400 to-orange-600',
      border: 'border-orange-500'
    },
    white: {
      primary: 'text-white',
      secondary: 'text-white/50',
      gradient: 'from-white to-gray-200',
      border: 'border-white'
    },
    gray: {
      primary: 'text-gray-500',
      secondary: 'text-gray-300',
      gradient: 'from-gray-400 to-gray-600',
      border: 'border-gray-500'
    },
    blue: {
      primary: 'text-blue-500',
      secondary: 'text-blue-300',
      gradient: 'from-blue-400 to-blue-600',
      border: 'border-blue-500'
    },
    green: {
      primary: 'text-green-500',
      secondary: 'text-green-300',
      gradient: 'from-green-400 to-green-600',
      border: 'border-green-500'
    },
    teal: {
      primary: 'text-teal-500',
      secondary: 'text-teal-300',
      gradient: 'from-teal-400 to-teal-600',
      border: 'border-teal-500'
    }
  };

  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast'
  };

  const currentColor = colorClasses[color] || colorClasses.orange;
  const currentSize = sizeClasses[size] || sizeClasses.md;
  const animationSpeed = speedClasses[speed] || speedClasses.normal;

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-6 h-6'} 
                bg-current rounded-full animate-bounce ${currentColor.primary}`}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${currentSize} ${currentColor.primary} animate-pulse`}>
            <div className="w-full h-full bg-current rounded-full"></div>
          </div>
        );

      case 'bounce':
        return (
          <div className={`${currentSize} ${currentColor.primary}`}>
            <div className="w-full h-full bg-current rounded-full animate-bounce"></div>
          </div>
        );

      case 'ring':
        return (
          <div className={`${currentSize} relative`}>
            <div className={`w-full h-full border-2 border-transparent ${currentColor.border} border-t-transparent rounded-full ${animationSpeed}`}></div>
            <div className={`absolute inset-2 border-2 border-transparent ${currentColor.secondary} border-t-transparent rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
        );

      case 'gradient':
        return (
          <div className={`${currentSize} relative`}>
            <div className={`w-full h-full bg-gradient-to-tr ${currentColor.gradient} rounded-full ${animationSpeed} opacity-75`}></div>
            <div className={`absolute inset-1 bg-white rounded-full`}></div>
            <div className={`absolute inset-2 bg-gradient-to-tr ${currentColor.gradient} rounded-full`}></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`${size === 'xs' ? 'w-1' : size === 'sm' ? 'w-1.5' : size === 'md' ? 'w-2' : size === 'lg' ? 'w-3' : size === 'xl' ? 'w-4' : 'w-6'} 
                bg-current ${currentColor.primary}`}
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animation: `barScale 1.2s ease-in-out infinite ${index * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'squares':
        return (
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`${size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-6 h-6'} 
                bg-current ${currentColor.primary} animate-pulse`}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              />
            ))}
          </div>
        );

      case 'heart':
        return (
          <div className={`${currentSize} ${currentColor.primary} animate-pulse`}>
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        );

      case 'logo':
        return (
          <div className={`${currentSize} ${currentColor.primary} ${animationSpeed}`}>
            <div className="w-full h-full bg-current rounded-full flex items-center justify-center text-white font-bold">
              IF
            </div>
          </div>
        );

      default:
        return (
          <svg
            className={`${animationSpeed} ${currentSize} ${currentColor.primary}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
    }
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}>
      <div className="flex items-center justify-center">
        {renderSpinner()}
      </div>
      {text && (
        <div className={`mt-4 text-center ${currentColor.primary} ${
          size === 'xs' || size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          size === 'lg' ? 'text-base' : 
          'text-lg'
        } font-medium animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen || overlay) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        overlay ? 'bg-black bg-opacity-50' : 'bg-white'
      }`}>
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Skeleton Loading Component
export const SkeletonLoader = ({ 
  variant = 'text',
  lines = 3,
  height = 'h-4',
  width = 'w-full',
  className = '',
  animate = true
}) => {
  const baseClasses = `bg-gray-300 rounded ${animate ? 'animate-pulse' : ''}`;

  switch (variant) {
    case 'avatar':
      return <div className={`w-12 h-12 bg-gray-300 rounded-full ${animate ? 'animate-pulse' : ''} ${className}`} />;
    
    case 'card':
      return (
        <div className={`space-y-4 ${className}`}>
          <div className={`h-48 bg-gray-300 rounded-lg ${animate ? 'animate-pulse' : ''}`} />
          <div className="space-y-2">
            <div className={`h-4 bg-gray-300 rounded w-3/4 ${animate ? 'animate-pulse' : ''}`} />
            <div className={`h-4 bg-gray-300 rounded w-1/2 ${animate ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      );
    
    case 'list':
      return (
        <div className={`space-y-3 ${className}`}>
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gray-300 rounded-full ${animate ? 'animate-pulse' : ''}`} />
              <div className="space-y-2 flex-1">
                <div className={`h-3 bg-gray-300 rounded w-1/4 ${animate ? 'animate-pulse' : ''}`} />
                <div className={`h-2 bg-gray-300 rounded w-3/4 ${animate ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      );
    
    default:
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={`${baseClasses} ${height} ${i === lines - 1 ? 'w-3/4' : width}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      );
  }
};

// Progress Bar Component
export const ProgressBar = ({
  progress = 0,
  size = 'md',
  color = 'orange',
  showPercentage = false,
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const colorClasses = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Custom CSS for additional animations
const customStyles = `
  @keyframes barScale {
    0%, 40%, 100% { transform: scaleY(0.4); }
    20% { transform: scaleY(1.0); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-fast {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 2s linear infinite;
  }
  
  .animate-spin-fast {
    animation: spin-fast 0.5s linear infinite;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default LoadingSpinner;