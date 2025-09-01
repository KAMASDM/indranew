// Enhanced Mobile-First Homepage with Bottom Navigation
'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import ImpactStats from '../components/ImpactStats';
import BackToTop from '../components/BackToTop';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import ganesh from '../../src/img/ganesh.jpeg';
// Local fallback images
const FALLBACK_IMAGES = {
  food: '/images/fallbacks/food-security.jpg',
  education: '/images/fallbacks/education.jpg',
  basicNeeds: '/images/fallbacks/basic-needs.jpg',
  environment: '/images/fallbacks/environment.jpg',
  default: '/images/fallbacks/default.jpg'
};

const HomePage = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInitiative, setActiveInitiative] = useState(0);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({ name: '', email: '', story: '' });
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const [storyError, setStoryError] = useState('');
  const [eventError, setEventError] = useState(null);
  const [galleryError, setGalleryError] = useState(null);
  const [galleryImageStates, setGalleryImageStates] = useState({});
  const [galleryImageErrors, setGalleryImageErrors] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [showMobileNav, setShowMobileNav] = useState(false);

// Default initiatives with proper fallbacks
const defaultInitiatives = [
  {
    id: 'rasodu',
    name: "Indraprasth nu Rasodu",
    description: "Providing over 200,000 free, nutritious meals to the needy through our community kitchen program. We serve fresh, healthy food daily to underprivileged families, homeless individuals, and anyone in need of a warm meal.",
    icon: "https://placehold.co/400x300/10B981/ffffff?text=Food+Security",
    imageUrl: "https://placehold.co/800x600/10B981/ffffff?text=Rasodu+Initiative",
    link: "/initiatives/indraprasth-nu-rasodu",
    impact: "200,000+ Meals Served",
    category: "food-security"
  },
  {
    id: 'education',
    name: "Educational Support",
    description: "Distributing notebooks, supplies, and educational materials to underprivileged students. We believe education is the key to breaking the cycle of poverty and creating opportunities for a better future.",
    icon: "https://placehold.co/400x300/3B82F6/ffffff?text=Education",
    imageUrl: "https://placehold.co/800x600/3B82F6/ffffff?text=Education+Support",
    link: "/initiatives/educational-support",
    impact: "1,500+ Students Supported",
    category: "education"
  },
  {
    id: 'blankets',
    name: "Blanket & Footwear Drive",
    description: "Offering warmth and comfort to homeless individuals during winters. Our annual drive provides blankets, warm clothing, and footwear to those who need it most during the cold season.",
    icon: "https://placehold.co/400x300/8B5CF6/ffffff?text=Basic+Needs",
    imageUrl: "https://placehold.co/800x600/8B5CF6/ffffff?text=Blanket+Drive",
    link: "/initiatives/blanket-footwear-drive",
    impact: "3,000+ Items Distributed",
    category: "basic-needs"
  },
  {
    id: 'ganesh',
    name: "Eco-friendly Ganesh Utsav",
    description: "Promoting environmental consciousness during festivals by encouraging eco-friendly celebrations, clay idols, and sustainable practices that honor tradition while protecting our environment.",
    icon: "https://placehold.co/400x300/059669/ffffff?text=Environment",
    imageUrl: "https://placehold.co/800x600/059669/ffffff?text=Eco+Ganesh",
    link: "/initiatives/eco-friendly-ganesh-utsav",
    impact: "50+ Communities Engaged",
    category: "environment"
  },
];

  const features = [
    {
      title: "100% Transparency",
      description: "Every rupee is tracked and its impact documented with complete transparency for our donors.",
      icon: "💎",
      color: "blue"
    },
    {
      title: "Community First",
      description: "Our programs are designed based on direct feedback from the communities we serve.",
      icon: "🤝",
      color: "green"
    },
    {
      title: "Sustainable Impact",
      description: "We focus on long-term solutions that create lasting positive change in lives.",
      icon: "🌱",
      color: "orange"
    },
    {
      title: "Local Expertise",
      description: "Deep understanding of Vadodara's needs through years of dedicated community service.",
      icon: "🏠",
      color: "purple"
    }
  ];

  // Mobile bottom navigation items
  const bottomNavItems = [
    { name: 'Home', href: '/', icon: '🏠', active: true },
    { name: 'Initiatives', href: '/initiatives', icon: '💡' },
    { name: 'Events', href: '/events', icon: '📅' },
    { name: 'Donate', href: '/donate', icon: '❤️' },
    { name: 'Contact', href: '/contact', icon: '📞' }
  ];

  // Text truncation function
  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Improved image loading handler with better fallbacks
  const handleImageError = (e, fallbackType = 'default') => {
    console.error('Image failed to load, using fallback:', e.target.src);
    e.target.src = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.default;
    e.target.onerror = null;
  };

  // Image loading handlers for gallery
  const handleGalleryImageLoad = (index) => {
    setGalleryImageStates(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleGalleryImageError = (index) => {
    setGalleryImageStates(prev => ({
      ...prev,
      [index]: false
    }));
    setGalleryImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Initiatives
        try {
          const initiativesQuery = query(collection(db, 'initiatives'), orderBy('createdAt', 'desc'), limit(4));
          const initiativesSnapshot = await getDocs(initiativesQuery);
          if (initiativesSnapshot.empty) {
            setInitiatives(defaultInitiatives);
          } else {
            const initiativesData = initiativesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              impact: doc.data().impact?.number + ' ' + doc.data().impact?.metric || 'Making Impact'
            }));
            setInitiatives(initiativesData.slice(0, 4));
          }
        } catch (error) {
          console.error("Error fetching initiatives:", error);
          setInitiatives(defaultInitiatives);
        }
        
        // Events
        try {
          const eventsQuery = query(collection(db, 'events'), orderBy('startDate', 'desc'), limit(3));
          const eventsSnapshot = await getDocs(eventsQuery);
          const eventsData = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate ? new Date(doc.data().startDate) : null
          }));
          setEvents(eventsData);
          setEventError(null);
        } catch (err) {
          console.error("Error fetching events:", err);
          setEventError(err.message || 'Failed to load events');
        }
        
        // Gallery
        try {
          const galleryQuery = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'), limit(8));
          const gallerySnapshot = await getDocs(galleryQuery);
          const galleryData = gallerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setGallery(galleryData);
          setGalleryError(null);
          const galleryLoadingStates = {};
          galleryData.forEach((_, index) => {
            galleryLoadingStates[index] = true;
          });
          setGalleryImageStates(galleryLoadingStates);
        } catch (err) {
          console.error("Error fetching gallery:", err);
          setGalleryError(err.message || 'Failed to load gallery');
        }
        
        // Testimonials
        try {
          const testimonialsQuery = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(6));
          const testimonialsSnapshot = await getDocs(testimonialsQuery);
          const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTestimonials(testimonialsData);
        } catch (error) {
          console.error("Error fetching testimonials:", error);
          setTestimonials([]);
        }
      } catch (error) {
        console.error("General error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Share Your Story handlers
  const handleStoryChange = (e) => {
    setStoryForm({ ...storyForm, [e.target.name]: e.target.value });
    setStoryError('');
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    setStorySubmitting(true);
    setStoryError('');
    setStorySuccess(false);
    try {
      if (!storyForm.name || !storyForm.email || !storyForm.story) {
        setStoryError('All fields are required.');
        setStorySubmitting(false);
        return;
      }
      await addDoc(collection(db, 'stories'), {
        ...storyForm,
        createdAt: serverTimestamp(),
      });
      setStorySuccess(true);
      setStoryForm({ name: '', email: '', story: '' });
      setTimeout(() => setShowStoryModal(false), 2000);
    } catch (err) {
      setStoryError('Failed to submit. Please try again.');
    } finally {
      setStorySubmitting(false);
    }
  };

  // Function to get appropriate fallback based on category
  const getFallbackImage = (category) => {
    switch(category) {
      case 'food-security': return FALLBACK_IMAGES.food;
      case 'education': return FALLBACK_IMAGES.education;
      case 'basic-needs': return FALLBACK_IMAGES.basicNeeds;
      case 'environment': return FALLBACK_IMAGES.environment;
      default: return FALLBACK_IMAGES.default;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Navbar />
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center text-xs transition-colors duration-200 ${
                item.active 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="pt-16">
        <Hero />
        <ImpactStats />

        {/* Initiatives Section - Mobile-First Design */}
        <section className="py-12 lg:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="px-4 lg:px-6 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8 lg:mb-16">
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 lg:mb-6">
                Our Impact Areas
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
                Key Initiatives
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Comprehensive programs addressing core community needs with measurable, sustainable impact.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 lg:py-20">
                <div className="inline-flex items-center space-x-4 bg-white rounded-lg shadow-lg px-6 py-4 lg:px-8 lg:py-6">
                  <LoadingSpinner size="lg" />
                  <span className="text-gray-600 font-medium">Loading initiatives...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Initiative Cards Grid - 3 Cards per Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-16">
                  {initiatives.map((item, index) => {
                    const isExpanded = expandedCards[item.id];
                    const shouldTruncate = item.description && item.description.length > 100;
                    const displayText = isExpanded || !shouldTruncate 
                      ? item.description 
                      : truncateText(item.description, 100);

                    return (
                      <div
                        key={item.id}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col"
                      >
                        {/* Image Section */}
                        <div className="relative bg-gray-100 h-48">
                          <Image
                            src={item.imageUrl || item.image?.url || item.bannerImage || item.icon || getFallbackImage(item.category)}
                            alt={`${item.name} initiative`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => handleImageError(e, item.category)}
                          />
                          
                          {/* Category Badge */}
                          {item.category && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                              {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          )}

                          {/* Impact Badge */}
                          <div className="absolute bottom-3 right-3 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                            {item.impact}
                          </div>
                        </div>

                        {/* Content Section - Fixed Height */}
                        <div className="p-6 flex flex-col justify-between flex-1 min-h-[260px]">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                              {item.name}
                            </h3>
                            
                            <div className="text-gray-600 leading-relaxed mb-4">
                              <p className="text-sm">{displayText}</p>
                              {shouldTruncate && (
                                <button
                                  onClick={() => toggleCardExpansion(item.id)}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 transition-colors duration-200"
                                >
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-auto">
                            <Link
                              href={item.link || '#'}
                              className="inline-flex items-center w-full justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-colors duration-300 shadow-md hover:shadow-lg"
                            >
                              Learn More
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View All Button */}
                <div className="text-center">
                  <Link
                    href="/initiatives"
                    className="inline-flex items-center bg-gray-900 hover:bg-black text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                  >
                    Explore All Initiatives
                    <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features Section - Mobile Optimized */}
        <section className="py-12 lg:py-20 bg-gray-100">
          <div className="px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-8 lg:mb-16">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 lg:mb-6">
                Why Choose Us
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
                Our Commitments
              </h2>
              <p className="text-lg lg:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed px-4">
                We believe in transparency, community engagement, and creating sustainable impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const colorClasses = {
                  blue: { bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50', border: 'border-blue-200' },
                  green: { bg: 'bg-green-500', text: 'text-green-600', bgLight: 'bg-green-50', border: 'border-green-200' },
                  orange: { bg: 'bg-orange-500', text: 'text-orange-600', bgLight: 'bg-orange-50', border: 'border-orange-200' },
                  purple: { bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50', border: 'border-purple-200' }
                };
                const colors = colorClasses[feature.color];

                return (
                  <div
                    key={index}
                    className="group text-center bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
                  >
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 rounded-xl ${colors.bg} flex items-center justify-center text-white text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>

                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Events Section - Enhanced Design */}
        <section className="py-12 lg:py-20 bg-gray-50">
          <div className="px-4 lg:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-16">
              <div>
                <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Latest Updates
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
                  Recent Events
                </h2>
                <p className="text-lg text-gray-600 mt-4 max-w-2xl">
                  Stay updated with our community activities and upcoming events that make a difference.
                </p>
              </div>
              <Link
                href="/events"
                className="hidden lg:inline-flex items-center text-blue-600 hover:text-blue-700 font-bold text-lg transition-colors duration-300 mt-4 lg:mt-0"
              >
                View All Events
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>

            {eventError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 lg:px-6 lg:py-4 rounded-lg mb-6 lg:mb-8 flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-sm lg:text-base">{eventError}</span>
                </div>
              </div>
            )}
            
            {events.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 lg:gap-8 mb-8 lg:mb-12">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 overflow-hidden"
                  >
                    {/* Event Image */}
                    <div className="relative h-56 lg:h-64 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                      <Image
                        src={event.imageUrl || event.image?.url || event.bannerImage || ganesh}
                        alt={`${event.name || 'Community Event'} event`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-2xl border-b-4 border-blue-200"
                        priority={index === 0}
                        loading={index === 0 ? undefined : "lazy"}
                      />
                      {/* Overlay for visual appeal */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                      {/* Event Status Badge */}
                      <div className="absolute top-4 left-4">
                        {event.status === 'upcoming' && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Upcoming
                          </div>
                        )}
                        {event.status === 'ongoing' && (
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Live Now
                          </div>
                        )}
                        {event.status === 'completed' && (
                          <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Completed
                          </div>
                        )}
                      </div>

                      {/* Date Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg shadow-lg">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600">
                            {event.startDate ? event.startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
                          </div>
                          <div className="text-lg font-bold leading-none">
                            {event.startDate ? event.startDate.getDate() : '?'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-b-2xl">
                      {/* Event Title */}
                      <h3 className="text-2xl font-extrabold text-blue-900 mb-2 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2 drop-shadow-sm">
                        {event.name || 'Community Event'}
                      </h3>

                      {/* Event Description */}
                      <p className="text-base lg:text-lg text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                        {event.description || 'Join us for this community event that brings people together for a meaningful cause.'}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-3 mb-6">
                        {/* Date and Time */}
                        {event.startDate && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <div>
                              <span className="font-medium text-sm">
                                {event.startDate.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                              {event.startTime && (
                                <span className="text-xs text-gray-400 ml-2">
                                  at {event.startTime}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span className="font-medium text-sm truncate">{event.location}</span>
                          </div>
                        )}

                        {/* Organizer */}
                        {event.organizer && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span className="font-medium text-sm">Organized by {event.organizer}</span>
                          </div>
                        )}

                        {/* Participants Count */}
                        {event.participantsCount && (
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span className="font-medium text-sm">{event.participantsCount} participants</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        {event.registrationUrl || event.link ? (
                          <Link
                            href={event.registrationUrl || event.link}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300 shadow-md hover:shadow-lg"
                          >
                            {event.status === 'upcoming' ? 'Register Now' : 'Learn More'}
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                          </Link>
                        ) : (
                          <div className="inline-flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            More details coming soon
                          </div>
                        )}

                        {/* Event Category */}
                        {event.category && (
                          <div className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 lg:py-20">
                <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <svg className="w-12 h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">No Recent Events</h3>
                <p className="text-gray-600 max-w-md mx-auto text-base lg:text-lg px-4 mb-8">
                  Stay tuned for upcoming community events and activities that make a difference. We&apos;re always planning something meaningful!
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  Browse All Events
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </Link>
              </div>
            )}

            {/* View All Events Button - Mobile */}
            <div className="text-center lg:hidden">
              <Link
                href="/events"
                className="inline-flex items-center bg-gray-900 hover:bg-black text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Explore All Events
                <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery Preview - Mobile Optimized */}
        {gallery.length > 0 && (
          <section className="py-12 lg:py-20 bg-white">
            <div className="px-4 lg:px-6 max-w-7xl mx-auto">
              <div className="text-center mb-8 lg:mb-16">
                <div className="inline-block bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900 px-4 py-2 rounded-full text-sm font-semibold mb-4 lg:mb-6 shadow">
                  Visual Stories
                </div>
                <h2 className="text-3xl lg:text-5xl font-extrabold text-purple-900 mb-4 lg:mb-6">
                  Moments That Matter
                </h2>
                <p className="text-lg lg:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed px-4">
                  Capturing the joy, hope, and transformation in our community
                </p>
              </div>

              {/* Gallery Grid - Mobile Responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-16">
                {gallery.slice(0, 8).map((image, index) => (
                  <div 
                    key={image.id} 
                    className="group relative w-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 aspect-square"
                  >
                    {galleryImageStates[index] && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-purple-500"></div>
                      </div>
                    )}

                    {galleryImageErrors[index] ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-xs lg:text-sm">Gallery Image</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={image.url}
                        alt={image.caption || `Gallery image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                        onLoad={() => handleGalleryImageLoad(index)}
                        onError={() => handleGalleryImageError(index)}
                        loading="lazy"
                      />
                    )}

                    {!galleryImageStates[index] && !galleryImageErrors[index] && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300"></div>
                    )}
                    
                    {image.caption && !galleryImageStates[index] && !galleryImageErrors[index] && (
                      <div className="absolute bottom-2 left-2 right-2 lg:bottom-4 lg:left-4 lg:right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <p className="text-xs lg:text-sm font-medium bg-black/70 rounded px-2 py-1 lg:px-3 lg:py-2 line-clamp-2">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/gallery"
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 lg:px-10 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-colors duration-300 shadow-xl hover:shadow-2xl"
                >
                  <svg className="mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path>
                  </svg>
                  Explore Full Gallery
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Fixed Tag Closing Issues */}
        <section className="bg-slate-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div>
          
          <div className="relative z-10 px-4 lg:px-6 max-w-7xl mx-auto py-16 lg:py-24 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Header Badge */}
              <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-full text-base lg:text-lg font-bold mb-8 shadow-xl">
                Join Our Mission
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white mb-8 leading-tight">
                Ready to Make a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  Real Difference?
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-slate-200 mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
                Your support can help us expand our reach and touch more lives. Get involved today and be part of the change.
              </p>

              {/* Impact Metrics - Redesigned Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">₹1 = 1 Meal</div>
                  <div className="text-slate-600 font-semibold text-lg">Your donation impact</div>
                  <div className="w-full h-2 bg-green-500 rounded-full mt-6 shadow-lg"></div>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">100% Direct</div>
                  <div className="text-slate-600 font-semibold text-lg">No administrative fees</div>
                  <div className="w-full h-2 bg-blue-500 rounded-full mt-6 shadow-lg"></div>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">24hr Impact</div>
                  <div className="text-slate-600 font-semibold text-lg">Immediate community help</div>
                  <div className="w-full h-2 bg-purple-500 rounded-full mt-6 shadow-lg"></div>
                </div>
              </div>

              {/* Action Buttons - Redesigned */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 lg:mb-20">
                <Link
                  href="/donate"
                  className="bg-green-500 hover:bg-green-600 text-white font-black py-5 px-10 lg:py-6 lg:px-14 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 inline-flex items-center justify-center text-xl lg:text-2xl"
                >
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Donate Now
                </Link>
                <Link
                  href="/volunteer"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-black py-5 px-10 lg:py-6 lg:px-14 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/25 inline-flex items-center justify-center text-xl lg:text-2xl"
                >
                  <svg className="w-7 h-7 lg:w-8 lg:h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Become a Volunteer
                </Link>
              </div>

              {/* Trust Indicators - Redesigned */}
              <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-xl">
                  <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span className="text-base lg:text-lg text-white font-bold">Registered NGO</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-xl">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-base lg:text-lg text-white font-bold">Transparent Operations</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-xl">
                  <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span className="text-base lg:text-lg text-white font-bold">Community Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Share Your Story Modal */}
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 lg:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 lg:top-6 lg:right-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowStoryModal(false)}
              >
                ×
              </button>

              <div className="mb-6 lg:mb-8">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Share Your Story
                </h3>
                <p className="text-gray-600 text-base lg:text-lg">
                  Your experience matters. Help inspire others by sharing how our community has impacted your life.
                </p>
              </div>

              <form onSubmit={handleStorySubmit} className="space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    value={storyForm.name}
                    onChange={handleStoryChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    value={storyForm.email}
                    onChange={handleStoryChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Your Story</label>
                  <textarea
                    name="story"
                    placeholder="Share your experience, impact, or how we've made a difference..."
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 min-h-[120px] focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    value={storyForm.story}
                    onChange={handleStoryChange}
                    required
                  />
                </div>

                {storyError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
                    {storyError}
                  </div>
                )}

                {storySuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 text-sm">
                    Thank you for sharing your story! We appreciate your contribution.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={storySubmitting}
                >
                  {storySubmitting ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-3">Submitting Your Story...</span>
                    </span>
                  ) : (
                    'Share Your Story'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default HomePage;