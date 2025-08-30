// src/app/initiatives/page.js
'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';

const InitiativesPage = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'initiatives'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setInitiatives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Failed to load initiatives.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center text-teal-700">All Initiatives</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : initiatives.length === 0 ? (
          <div className="text-gray-500 text-center">No initiatives found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map(initiative => (
              <div key={initiative.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                <div className="relative h-48 mb-4">
                  <Image src={initiative.imageUrl || '/default-initiative.jpg'} alt={initiative.title || initiative.name} fill className="object-cover rounded-md" />
                </div>
                <h2 className="text-2xl font-semibold text-teal-800 mb-2">{initiative.title || initiative.name}</h2>
                <p className="text-gray-600 mb-4 flex-1">{initiative.description}</p>
                <a href={`/initiatives/${initiative.slug || initiative.id}`} className="mt-auto inline-block bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition">View Details</a>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InitiativesPage;
