// Updated src/components/Hero.js with teal colors
'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';

const Hero = () => {
  const [heroImageUrl, setHeroImageUrl] = useState('/default-hero.jpg');
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const q = query(collection(db, 'heroImages'), orderBy('uploadedAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestImage = querySnapshot.docs[0].data();
          setHeroImageUrl(latestImage.url);
        }
      } catch (error) {
        console.error("Error fetching hero image: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImage();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = heroImageUrl;
    img.onload = () => setImageLoaded(true);
  }, [heroImageUrl]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-gradient-to-r from-teal-400 to-soft-teal-500">
        <LoadingSpinner size="xl" color="white" />
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      {/* Fallback gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 to-soft-teal-600 transition-opacity duration-1000 ${
        imageLoaded ? 'opacity-0' : 'opacity-100'
      }`}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            <span className="block">Empowering Communities</span>
            <span className="block text-teal-300">Changing Lives</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto mb-10 opacity-90 animate-fade-in-up animation-delay-300">
            Join Indraprasth Foundation in our mission to bring hope, support, and lasting change 
            to those in need across Vadodara through compassionate community service.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center animate-fade-in-up animation-delay-600">
            <Link 
              href="/donate" 
              className="group bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center justify-center">
                Donate Now
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </Link>
            <Link 
              href="/about" 
              className="group border-2 border-white text-white hover:bg-white hover:text-gray-800 font-bold py-4 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center">
                Learn More
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;
