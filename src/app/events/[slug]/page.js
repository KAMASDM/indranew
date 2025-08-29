'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Image from 'next/image';

const EventDetailPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      
      try {
        // Since we don't have slug field in events, we'll use the ID
        const q = query(collection(db, 'events'));
        const querySnapshot = await getDocs(q);
        
        const foundEvent = querySnapshot.docs.find(doc => 
          doc.id === slug || doc.data().name.toLowerCase().replace(/\s+/g, '-') === slug
        );
        
        if (foundEvent) {
          setEvent({ id: foundEvent.id, ...foundEvent.data() });
        } else {
          setError('Event not found');
        }
      } catch (error) {
        console.error("Error fetching event: ", error);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-white">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <a href="/events" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300">
              View All Events
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Navbar />
      <main className="pt-20">
        <article className="container mx-auto px-6 py-16 max-w-4xl">
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {event.name}
            </h1>
          </header>

          <div className="prose lg:prose-xl max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed">
              {event.description || "This was an amazing event where we came together as a community to make a positive impact. The Indraprasth Foundation continues to organize such meaningful initiatives to serve our community in Vadodara."}
            </p>
          </div>

          <div className="mt-12 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-600">
              <div>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  new Date(event.date) > new Date() 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {new Date(event.date) > new Date() ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/events" 
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300"
            >
              ← Back to Events
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default EventDetailPage;