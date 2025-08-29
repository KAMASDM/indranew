'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      <div className="pt-20">
        <header className="bg-orange-100 text-center py-20">
          <h1 className="text-5xl font-bold text-gray-800">Our Events</h1>
          <p className="text-xl mt-4 text-gray-600">Join us in making a difference.</p>
        </header>
        
        <main className="container mx-auto px-6 py-16">
          {loading ? (
            <div className="text-center text-gray-500">Loading events...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition duration-300">
                  <div className="p-6">
                    <p className="text-orange-500 font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                    <h3 className="text-2xl font-bold mt-2 text-gray-800">{event.name}</h3>
                    <p className="text-gray-600 mt-2">{event.description || "More details to come."}</p>
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

export default EventsPage;