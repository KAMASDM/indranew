// src/app/initiatives/page.js
'use client';
import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

const InitiativesPage = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to hold error messages

  // Default initiatives if none in database
  const defaultInitiatives = [
    {
      id: 'rasodu',
      title: 'Indraprasth nu Rasodu',
      description: 'Our flagship program providing over 200,000 free, nutritious meals to the needy in Vadodara. We serve hot meals daily to daily wage workers, homeless individuals, and families in need.',
      imageUrl: '/rasodu-banner.jpg',
      slug: 'indraprasth-nu-rasodu'
    },
    {
      id: 'education',
      title: 'Educational Support',
      description: 'Supporting underprivileged students by distributing notebooks, school supplies, and providing educational assistance to help children continue their studies.',
      imageUrl: '/education-banner.jpg',
      slug: 'educational-support'
    },
    {
      id: 'blankets',
      title: 'Blanket & Footwear Drive',
      description: 'During winter months, we distribute blankets and footwear to homeless individuals and families, providing warmth and basic necessities.',
      imageUrl: '/blanket-drive.jpg',
      slug: 'blanket-footwear-drive'
    },
    {
      id: 'ganesh',
      title: 'Eco-friendly Ganesh Utsav',
      description: 'Promoting environmental consciousness during Ganesh Utsav by encouraging eco-friendly celebrations and clay idol immersions.',
      imageUrl: '/ganesh-eco.jpg',
      slug: 'eco-friendly-ganesh-utsav'
    }
  ];

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const q = query(collection(db, 'initiatives'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            // If the database is empty, use the default list
            console.log("No initiatives found in Firestore, using default list.");
            setInitiatives(defaultInitiatives);
        } else {
            const initiativesData = querySnapshot.docs.map(doc => ({ 
              id: doc.id, 
              ...doc.data() 
            }));
            setInitiatives(initiativesData);
        }

      } catch (err) {
        // If there's an error, log it and display an error message
        console.error("Error fetching initiatives: ", err);
        setError("Could not fetch initiatives. Please check the console for more details.");
        // Fallback to default initiatives on error
        setInitiatives(defaultInitiatives);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitiatives();
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      <div className="pt-20">
        <header className="bg-gradient-to-r from-orange-400 to-orange-600 text-white text-center py-20">
          <h1 className="text-5xl font-bold">Our Initiatives</h1>
          <p className="text-xl mt-4">Transforming lives through dedicated community service</p>
        </header>
        
        <main className="container mx-auto px-6 py-16">
          {loading ? (
            <div className="text-center py-16">
              <LoadingSpinner size="xl" />
              <p className="text-gray-500 mt-4">Loading our initiatives...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">{error}</div>
          ) : (
            <div className="grid gap-12">
              {initiatives.map((initiative, index) => (
                <div 
                  key={initiative.id} 
                  className={`grid md:grid-cols-2 gap-8 items-center ${
                    index % 2 === 1 ? 'md:grid-flow-col-dense' : ''
                  }`}
                >
                  <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={initiative.imageUrl || '/default-initiative.jpg'}
                        alt={initiative.title}
                        fill
                        className="object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                  </div>
                  <div className={`${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      {initiative.title}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {initiative.description}
                    </p>
                    <Link 
                      href={`/initiatives/${initiative.slug || initiative.id}`}
                      className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300 font-semibold"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default InitiativesPage;