// Enhanced src/components/ImpactStats.js - Redesigned with Modern & Professional CSS
'use client';
import { useEffect, useState, useRef } from 'react';

const ImpactStats = ({ variant = 'default', showAnimation = true, customStats = null }) => {
  const [stats, setStats] = useState([
    { label: 'Meals Served', value: 0, target: 200000, icon: '🍽️', description: 'Free nutritious meals provided to those in need', suffix: '+' },
    { label: 'Families Helped', value: 0, target: 5000, icon: '👥', description: 'Families receiving our support and services', suffix: '+' },
    { label: 'Active Volunteers', value: 100, target: 150, icon: '🤝', description: 'Dedicated volunteers making a difference', suffix: '+' },
    { label: 'Years of Service', value: 10, target: 5, icon: '⭐', description: 'Years of continuous community service' },
    { label: 'Community Programs', value: 10, target: 12, icon: '🎯', description: 'Different programs serving various needs' },
    { label: 'Partner Network', value: 10, target: 25, icon: '🌟', description: 'Partner organizations and supporters', suffix: '+' }
  ]);
  
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (customStats) {
      setStats(customStats.map(stat => ({ ...stat, value: 0 })));
    }
  }, [customStats]);

  useEffect(() => {
    if (!showAnimation) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    }, { threshold: 0.3 });

    const element = sectionRef.current;
    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [showAnimation, hasAnimated]);

  useEffect(() => {
    if (!showAnimation && !isVisible) {
      setStats(prevStats => prevStats.map(stat => ({ ...stat, value: stat.target })));
      return;
    }
    if (!isVisible) return;

    const duration = 2500;
    const frameRate = 16;
    const totalFrames = duration / frameRate;

    const timer = setInterval(() => {
      setStats(prevStats => {
        const newStats = prevStats.map(stat => {
          const increment = stat.target / totalFrames;
          const newValue = Math.min(stat.value + increment, stat.target);
          return { ...stat, value: Math.round(newValue) };
        });

        if (newStats.every(s => s.value >= s.target)) {
          clearInterval(timer);
          return newStats.map(s => ({...s, value: s.target}));
        }
        return newStats;
      });
    }, frameRate);

    return () => clearInterval(timer);
  }, [isVisible, showAnimation]);

  const formatNumber = (num, prefix = '', suffix = '') => {
    const value = Math.round(num);
    const formattedNum = value.toLocaleString('en-IN');
    return `${prefix || ''}${formattedNum}${suffix || ''}`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-white border-y border-slate-200',
          wrapper: 'container mx-auto px-6 py-12',
          grid: 'grid grid-cols-2 md:grid-cols-4 text-center divide-x divide-slate-200',
          card: 'px-4 sm:px-6 py-4',
          value: 'text-3xl md:text-4xl font-bold text-slate-800 mb-1 tracking-tight',
          label: 'text-sm font-medium text-slate-500',
        };
      case 'compact':
        return {
          container: 'bg-white py-12',
          wrapper: 'container mx-auto px-6',
          title: 'text-2xl font-bold text-slate-800 mb-8 text-center',
          grid: 'grid grid-cols-2 md:grid-cols-4 gap-4',
          card: 'text-center bg-slate-50 rounded-lg p-4 border border-slate-200 transition-shadow hover:shadow-md',
          value: 'text-2xl font-bold text-slate-800',
          label: 'text-slate-600 font-medium text-xs',
        };
      case 'cards':
        return {
          container: 'bg-slate-50 py-20',
          wrapper: 'container mx-auto px-6',
          title: 'text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 text-center tracking-tight',
          subtitle: 'text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto',
          grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
          card: 'bg-white rounded-xl shadow-lg p-8 text-center transition-all duration-300 transform hover:shadow-xl hover:-translate-y-2',
          icon: 'text-4xl mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600',
          value: 'text-4xl font-bold text-slate-800 mb-2',
          label: 'text-slate-700 font-semibold text-lg mb-3',
          description: 'text-slate-500 text-sm leading-relaxed',
        };
      default: // 'default' variant
        return {
          container: 'bg-slate-900 text-white relative py-20 overflow-hidden',
          wrapper: 'container mx-auto px-6 relative z-10',
          title: 'text-3xl md:text-4xl font-extrabold mb-4 text-center tracking-tight',
          subtitle: 'text-lg text-slate-300 text-center mb-12 max-w-2xl mx-auto',
          grid: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8',
          card: 'text-center',
          icon: 'text-4xl mb-3',
          value: 'text-4xl md:text-5xl font-bold mb-2',
          label: 'text-slate-400 font-medium uppercase text-xs tracking-wider',
        };
    }
  };

  const styles = getVariantStyles();
  const displayStats = variant === 'compact' ? stats.slice(0, 4) : stats;

  return (
    <section ref={sectionRef} className={styles.container}>
      {variant === 'default' && (
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '2rem 2rem' }}></div>
      )}

      <div className={styles.wrapper}>
        {(variant === 'default' || variant === 'cards') && (
          <div className="mb-12">
            <h2 className={styles.title}>Our Impact by the Numbers</h2>
            <p className={styles.subtitle}>Every number represents a life changed, a community strengthened, and a step towards a better future.</p>
          </div>
        )}
        
        {variant === 'compact' && (
          <h2 className={styles.title}>At a Glance</h2>
        )}

        <div className={styles.grid}>
          {displayStats.map((stat, index) => (
            <div 
              key={index} 
              className={`${styles.card} ${
                showAnimation 
                  ? `transition-all duration-500 ease-out ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }` 
                  : 'opacity-100'
              }`}
              style={{ transitionDelay: showAnimation ? `${index * 100}ms` : '0ms' }}
            >
              {styles.icon && <div className={styles.icon}>{stat.icon}</div>}
              <div className={styles.value}>
                {formatNumber(stat.value, stat.prefix, stat.suffix)}
              </div>
              <div className={styles.label}>{stat.label}</div>
              {styles.description && stat.description && (
                <p className={styles.description}>{stat.description}</p>
              )}
            </div>
          ))}
        </div>

        {variant === 'default' && (
          <div className="mt-16 text-center">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-lg p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <div>
                  <div className="text-2xl font-bold">₹5 = 1 Meal</div>
                  <div className="text-sm text-slate-300 mt-1">Direct impact of your donation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">100% Transparent</div>
                  <div className="text-sm text-slate-300 mt-1">All operations are fully documented</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7 Support</div>
                  <div className="text-sm text-slate-300 mt-1">Always there for our community</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {variant === 'cards' && (
          <div className="mt-16 text-center">
            <div className="bg-blue-600 text-white rounded-xl p-8 max-w-4xl mx-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-3">Be a Part of the Change</h3>
              <p className="opacity-90 mb-6">
                Your support can help these numbers grow. Join our mission to uplift the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold transform transition-transform hover:scale-105">
                  Donate Now
                </button>
                <button className="border-2 border-white/50 text-white px-8 py-3 rounded-lg font-semibold transform transition-transform hover:scale-105 hover:bg-white/10">
                  Volunteer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImpactStats;