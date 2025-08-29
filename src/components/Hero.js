'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

const Hero = () => {
  const [heroImageUrl, setHeroImageUrl] = useState('/default-hero.jpg'); // Provide a default image
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center bg-gray-200 animate-pulse">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] bg-cover bg-center text-white" style={{ backgroundImage: `url(${heroImageUrl})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
          Empowering Communities, Changing Lives
        </h1>
        <p className="text-lg md:text-2xl max-w-3xl mb-8 animate-fade-in-up">
          Join Indraprasth Foundation in our mission to bring hope and support to those in need across Vadodara.
        </p>
        <div className="flex space-x-4">
          <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
            Donate Now
          </Link>
          <Link href="/about" className="bg-white hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;