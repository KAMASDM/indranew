// Completely Fixed src/components/Hero.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Hero = () => {
  // State for the array of images from Firestore and the current index
  const [heroImages, setHeroImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Effect to fetch hero images from Firestore on component mount
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        // Query to get all images, ordered by the upload date (newest first)
        const q = query(collection(db, 'heroImages'), orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const images = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setHeroImages(images);
          console.log('Hero images fetched:', images);
          
          // Initialize loading states for all images
          const initialLoadingStates = {};
          images.forEach((_, index) => {
            initialLoadingStates[index] = true;
          });
          setImageLoadingStates(initialLoadingStates);
        } else {
          setHeroImages([{ url: '/default-hero.jpg', id: 'default' }]);
          setImageLoadingStates({ 0: true });
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        setFetchError(error.message || 'Error fetching hero images');
        setHeroImages([{ url: '/default-hero.jpg', id: 'default' }]);
        setImageLoadingStates({ 0: true });
      } finally {
        setLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  // Effect to handle the carousel rotation
  useEffect(() => {
    if (heroImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 7000); // Change image every 7 seconds

      return () => clearInterval(timer); // Cleanup interval on component unmount
    }
  }, [heroImages.length]);

  // Handle image loading completion
  const handleImageLoad = (index) => {
    console.log(`Hero image ${index} loaded successfully`);
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
  };

  // Handle image loading errors
  const handleImageError = (index) => {
    console.error(`Hero image ${index} failed to load`);
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  if (loading) {
    return (
      <section className="h-screen flex flex-col items-center justify-center bg-slate-100">
        <LoadingSpinner size="xl" />
        {fetchError && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <span>{fetchError}</span>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div 
            key={image.id || index} 
            className="absolute inset-0"
            style={{ zIndex: index === currentIndex ? 1 : 0 }}
          >
            {/* Loading skeleton for current image */}
            {imageLoadingStates[index] && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Loading hero image...</p>
                </div>
              </div>
            )}
            
            {/* Error fallback */}
            {imageErrors[index] ? (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-lg font-semibold">Indraprasth Foundation</p>
                  <p className="text-sm opacity-75">Community Service in Vadodara</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                <Image
                  src={image.url}
                  alt="Indraprasth Foundation Community Work"
                  width={1920}
                  height={1080}
                  className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                  quality={90}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  sizes="100vw"
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Dark overlay - always show for content readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center text-white max-w-6xl mx-auto px-6">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-white/90 rounded-full p-3 shadow-xl backdrop-blur-sm">
            <Image 
              src="/indra.png" 
              alt="Indraprasth Foundation Logo" 
              width={96} 
              height={96} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
          Empowering Communities,
          <br/>
          <span className="text-blue-400">Transforming Lives</span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-slate-200 drop-shadow-md">
          Join Indraprasth Foundation in Vadodara to bring hope and lasting change through compassionate community service.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/donate"
            className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center justify-center text-lg"
          >
             <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
             </svg>
            Donate Now
          </Link>
          
          <Link 
            href="/volunteer"
            className="group bg-white hover:bg-gray-100 text-gray-900 hover:text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm inline-flex items-center justify-center text-lg border-2 border-white"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Become a Volunteer
          </Link>
        </div>
      </div>
      
      {/* Carousel Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;