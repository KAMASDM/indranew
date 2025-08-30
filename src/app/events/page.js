// Enhanced src/app/events/page.js
'use client';
import { useEffect, useState, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [imageDayFilter, setImageDayFilter] = useState('all');
  const [imageMetaFilter, setImageMetaFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Corrected the orderBy field from 'date' to 'startDate'
      const q = query(collection(db, 'events'), orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let images = Array.isArray(data.images) ? data.images : [];
        if (!images.length && data.imageUrl) {
          images = [{ url: data.imageUrl, name: 'Event Image', uploadedAt: data.startDate }];
        }
        return {
          id: doc.id,
          ...data,
          // Correctly handle the date field, now using startDate
          date: data.startDate ? (data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate)) : new Date(),
          name: data.name || 'Untitled Event',
          description: data.description || 'No description available',
          location: data.location || 'Vadodara, Gujarat',
          category: data.category || 'community',
          images,
          maxAttendees: data.maxAttendees || null,
          registeredAttendees: data.registeredAttendees || 0,
          status: data.status || 'scheduled'
        };
      });
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events;
    // Apply time filter
    const now = new Date();
    if (filter === 'upcoming') {
      filtered = events.filter(event => new Date(event.date) >= now);
    } else if (filter === 'past') {
      filtered = events.filter(event => new Date(event.date) < now);
    }
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [events, filter, searchQuery]);

  // Gather all unique days and metadata from images for filter dropdowns
  const allImageDays = useMemo(() => {
    const days = new Set();
    events.forEach(event => {
      event.images?.forEach(img => {
        if (img.uploadedAt) {
          const d = typeof img.uploadedAt === 'string' ? new Date(img.uploadedAt) : (img.uploadedAt?.toDate?.() || img.uploadedAt);
          days.add(d.toISOString().slice(0, 10));
        }
      });
    });
    return Array.from(days).sort();
  }, [events]);

  const allImageMeta = useMemo(() => {
    const meta = new Set();
    events.forEach(event => {
      event.images?.forEach(img => {
        if (img.meta) meta.add(img.meta);
      });
    });
    return Array.from(meta).sort();
  }, [events]);

  const eventStats = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(event => new Date(event.date) >= now);
    const past = events.filter(event => new Date(event.date) < now);
    const thisMonth = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    });
    
    return {
      total: events.length,
      upcoming: upcoming.length,
      past: past.length,
      thisMonth: thisMonth.length
    };
  }, [events]);

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    
    if (event > now) {
      const timeDiff = event - now;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) return { text: 'Tomorrow', color: 'bg-yellow-100 text-yellow-800' };
      if (daysDiff <= 7) return { text: `In ${daysDiff} days`, color: 'bg-green-100 text-green-800' };
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { text: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEventTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-20">
          <header className="bg-gradient-to-r from-orange-100 to-orange-200 text-center py-20">
            <h1 className="text-5xl font-bold text-gray-800">Our Events</h1>
            <p className="text-xl mt-4 text-gray-600">Join us in making a difference</p>
          </header>
          <div className="container mx-auto px-6 py-16 text-center">
            <LoadingSpinner size="xl" />
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-orange-400 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 text-center py-20">
            <div className="container mx-auto px-6">
              <h1 className="text-5xl font-bold mb-4">Our Events</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Join us in our mission to create positive change in the community through meaningful events and activities
              </p>
              
              {/* Event Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{eventStats.total}</div>
                  <div className="text-sm opacity-90">Total Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{eventStats.upcoming}</div>
                  <div className="text-sm opacity-90">Upcoming</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{eventStats.thisMonth}</div>
                  <div className="text-sm opacity-90">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{eventStats.past}</div>
                  <div className="text-sm opacity-90">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-6 py-16">
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span>{error}</span>
              </div>
              <button
                onClick={fetchEvents}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="mb-12">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { id: 'all', label: 'All Events', icon: '📅' },
                { id: 'upcoming', label: 'Upcoming', icon: '⏰' },
                { id: 'past', label: 'Past Events', icon: '📋' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    filter === tab.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="bg-black/20 text-xs px-2 py-1 rounded-full">
                    {tab.id === 'all' ? eventStats.total : 
                     tab.id === 'upcoming' ? eventStats.upcoming : eventStats.past}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Image Filters */}
          <div className="flex flex-wrap gap-4 mb-8 items-center justify-center">
            <div>
              <label className="mr-2 font-medium">Filter Images by Day:</label>
              <select
                value={imageDayFilter}
                onChange={e => setImageDayFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All Days</option>
                {allImageDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            {allImageMeta.length > 0 && (
              <div>
                <label className="mr-2 font-medium">Filter by Meta:</label>
                <select
                  value={imageMetaFilter}
                  onChange={e => setImageMetaFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  {allImageMeta.map(meta => (
                    <option key={meta} value={meta}>{meta}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map(event => {
                const status = getEventStatus(event.date);
                const isUpcoming = new Date(event.date) > new Date();
                // Filter images for this event
                let filteredImages = event.images || [];
                if (imageDayFilter !== 'all') {
                  filteredImages = filteredImages.filter(img => {
                    if (!img.uploadedAt) return false;
                    const d = typeof img.uploadedAt === 'string' ? new Date(img.uploadedAt) : (img.uploadedAt?.toDate?.() || img.uploadedAt);
                    return d.toISOString().slice(0, 10) === imageDayFilter;
                  });
                }
                if (imageMetaFilter !== 'all') {
                  filteredImages = filteredImages.filter(img => img.meta === imageMetaFilter);
                }
                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Event Images Gallery */}
                    <div className="relative h-48 overflow-x-auto flex gap-2 p-2 bg-gray-50">
                      {filteredImages.length > 0 ? (
                        filteredImages.map((img, idx) => (
                          <div key={img.url || idx} className="relative h-44 w-64 flex-shrink-0 rounded overflow-hidden border">
                            <Image
                              src={img.url}
                              alt={img.name || event.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
                              {img.name || 'Event Image'}
                              {img.uploadedAt && (
                                <span className="ml-2">{typeof img.uploadedAt === 'string' ? img.uploadedAt.slice(0,10) : (img.uploadedAt?.toDate?.()?.toISOString().slice(0,10) || '')}</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">No images</div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                    {/* Event Content */}
                    <div className="p-6">
                      {/* Date and Time */}
                      <div className="flex items-center text-orange-600 text-sm font-medium mb-3">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                        {event.name}
                      </h3>
                      {/* Event Description */}
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {event.description}
                      </p>
                      {/* Event Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{formatEventTime(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            <span className="capitalize">{event.category}</span>
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Link
                          href={`/events/${event.id}`}
                          className="flex-1 bg-orange-500 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {isUpcoming && (
                          <button
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm font-medium"
                            onClick={() => {
                              // Handle event registration
                              alert('Registration feature coming soon!');
                            }}
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No events match "${searchQuery}". Try a different search term.`
                    : filter === 'upcoming'
                      ? "No upcoming events scheduled at the moment. Check back soon!"
                      : filter === 'past'
                        ? "No past events to display."
                        : "No events available at the moment."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSearchQuery('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
                  >
                    Show All Events
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {filteredEvents.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated on Our Events</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Don&apos;t miss out on our upcoming events and activities. Subscribe to our newsletter
                  to receive event notifications and updates directly in your inbox.
                </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/volunteer"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300 font-semibold"
                >
                  Become a Volunteer
                </Link>
                <Link
                  href="/contact"
                  className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-500 hover:text-white transition duration-300 font-semibold"
                >
                  Organize an Event
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EventsPage;