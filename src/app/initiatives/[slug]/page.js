'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Image from 'next/image';

const InitiativePage = () => {
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    const fetchInitiative = async () => {
      if (!slug) return;
      try {
        const q = query(collection(db, 'initiatives'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setInitiative(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching initiative: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitiative();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!initiative) {
    return <div className="min-h-screen flex items-center justify-center">Initiative not found.</div>;
  }

  return (
    <div className="bg-white">
      <Navbar />
      <main className="pt-20">
        <header className="relative h-96">
            <Image src={initiative.imageUrl} alt={initiative.title} layout="fill" objectFit="cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <h1 className="text-5xl font-bold text-white text-center">{initiative.title}</h1>
            </div>
        </header>
        <div className="container mx-auto px-6 py-16">
            <div className="prose lg:prose-xl max-w-4xl mx-auto">
                <p>{initiative.content}</p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InitiativePage;

