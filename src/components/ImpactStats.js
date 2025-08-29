// Updated src/components/ImpactStats.js with teal colors
'use client';
import { useEffect, useState } from 'react';

const ImpactStats = () => {
  const [stats, setStats] = useState([
    { label: 'Meals Served', value: 0, target: 200000, icon: '🍽️' },
    { label: 'Families Helped', value: 0, target: 5000, icon: '👥' },
    { label: 'Volunteers', value: 0, target: 150, icon: '🤝' },
    { label: 'Years of Service', value: 0, target: 5, icon: '⭐' }
  ]);
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('impact-stats');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const frameRate = 16; // ~60fps
    const totalFrames = duration / frameRate;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      setStats(prevStats =>
        prevStats.map(stat => ({
          ...stat,
          value: Math.min(Math.floor(stat.target * progress), stat.target)
        }))
      );

      if (frame >= totalFrames) {
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section id="impact-stats" className="bg-gradient-to-r from-teal-500 to-soft-teal-600 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
          <p className="text-xl text-teal-100">Making a difference, one step at a time</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value.toLocaleString()}+
              </div>
              <div className="text-teal-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;