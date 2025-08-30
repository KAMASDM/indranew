// Enhanced src/app/page.js - Fixed Homepage Design with Proper Image Loading
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

// Default initiatives if database is empty - using placehold.co
const defaultInitiatives = [
  {
    id: 'rasodu',
    name: "Indraprasth nu Rasodu",
    description: "Providing over 200,000 free, nutritious meals to the needy.",
    // Updated URL
    icon: "https://placehold.co/400x300/10B981/ffffff?text=Food+Security",
    // Updated URL
    imageUrl: "https://placehold.co/800x600/10B981/ffffff?text=Rasodu+Initiative",
    link: "/initiatives/indraprasth-nu-rasodu",
    impact: "200,000+ Meals Served",
    category: "food-security"
  },
  {
    id: 'education',
    name: "Educational Support",
    description: "Distributing notebooks and supplies to underprivileged students.",
    // Updated URL
    icon: "https://placehold.co/400x300/3B82F6/ffffff?text=Education",
    // Updated URL
    imageUrl: "https://placehold.co/800x600/3B82F6/ffffff?text=Education+Support",
    link: "/initiatives/educational-support",
    impact: "1,500+ Students Supported",
    category: "education"
  },
  {
    id: 'blankets',
    name: "Blanket & Footwear Drive",
    description: "Offering warmth and comfort to homeless individuals during winters.",
    // Updated URL
    icon: "https://placehold.co/400x300/8B5CF6/ffffff?text=Basic+Needs",
    // Updated URL
    imageUrl: "https://placehold.co/800x600/8B5CF6/ffffff?text=Blanket+Drive",
    link: "/initiatives/blanket-footwear-drive",
    impact: "3,000+ Items Distributed",
    category: "basic-needs"
  },
  {
    id: 'ganesh',
    name: "Eco-friendly Ganesh Utsav",
    description: "Promoting environmental consciousness during festivals.",
    // Updated URL
    icon: "https://placehold.co/400x300/059669/ffffff?text=Environment",
    // Updated URL
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
      icon: "🔍",
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
      icon: "🏡",
      color: "purple"
    }
  ];

  // Improved image loading handler with better fallbacks
  const handleImageError = (e, fallbackType = 'default') => {
    console.error('Image failed to load, using fallback:', e.target.src);
    e.target.src = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.default;
    e.target.onerror = null; // Prevent infinite loop
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
        // Hero Images
        try {
          const heroQuery = query(collection(db, 'heroImages'), orderBy('uploadedAt', 'desc'));
          const heroSnapshot = await getDocs(heroQuery);
          if (!heroSnapshot.empty) {
            setHeroImages(heroSnapshot.docs.map(doc => doc.data()));
          }
        } catch (error) {
          console.error("Error fetching hero images:", error);
        }

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
          // Initialize loading states for gallery
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

  // Share Your Story submit handler
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

  // Auto-rotate initiatives
  useEffect(() => {
    if (initiatives.length > 1) {
      const interval = setInterval(() => {
        setActiveInitiative(prev => (prev + 1) % initiatives.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [initiatives.length]);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <ImpactStats />

        {/* Initiatives Section - Completely Redesigned */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 border-y border-gray-200">
          <div className="container mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                Our Impact Areas
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Key Initiatives
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive programs addressing core community needs with measurable, sustainable impact.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center space-x-4 bg-white rounded-lg shadow-lg px-8 py-6">
                  <LoadingSpinner size="lg" />
                  <span className="text-gray-600 font-medium">Loading initiatives...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Featured Initiative - Full Width Card */}
                {initiatives.length > 0 && (
                  <div className="mb-20">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto border border-gray-200">
                      <div className="grid lg:grid-cols-2 gap-0">
                        {/* Image Section - Simplified */}
                        <div className="relative bg-gray-100" style={{ minHeight: '400px' }}>
                          <Image
                            src={initiatives[activeInitiative]?.imageUrl || 
                                 initiatives[activeInitiative]?.image?.url || 
                                 initiatives[activeInitiative]?.bannerImage || 
                                 getFallbackImage(initiatives[activeInitiative]?.category)}
                            alt={initiatives[activeInitiative]?.name || 'Initiative'}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                            priority={true}
                            onError={(e) => handleImageError(e, initiatives[activeInitiative]?.category)}
                          />
                          
                          {/* Gradient Overlay - Always show */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                          {/* Initiative Indicators */}
                          <div className="absolute bottom-6 left-6 right-6 z-20">
                            <div className="flex justify-between items-end">
                              <div className="flex space-x-2">
                                {initiatives.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setActiveInitiative(index)}
                                    className={`transition-all duration-300 rounded-full ${
                                      index === activeInitiative
                                        ? 'w-8 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-white text-sm font-medium bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                                {activeInitiative + 1} / {initiatives.length}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="mb-8">
                            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                              Featured Initiative
                            </div>
                            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                              {initiatives[activeInitiative]?.name}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                              {initiatives[activeInitiative]?.description}
                            </p>
                          </div>

                          {/* Impact Metric */}
                          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
                            <div className="flex items-center">
                              <svg className="w-8 h-8 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                              </svg>
                              <div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {initiatives[activeInitiative]?.impact}
                                </div>
                                <div className="text-green-700 font-medium">Impact Achieved</div>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={initiatives[activeInitiative]?.link || '#'}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
                          >
                            Learn More About This Initiative
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Initiatives - Horizontal Card Layout */}
                <div className="space-y-8 mb-16">
                  {initiatives.map((item, index) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
                    >
                      <div className="grid md:grid-cols-3 gap-0">
                        {/* Image Section */}
                        <div className="relative bg-gray-100 md:h-64 h-48">
                          <Image
                            src={item.imageUrl || item.image?.url || item.bannerImage || item.icon || getFallbackImage(item.category)}
                            alt={`${item.name} initiative`}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => handleImageError(e, item.category)}
                          />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            {item.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Initiative'}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="md:col-span-2 p-8 flex flex-col justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Impact Badge */}
                            <div className="inline-flex items-center bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                              </svg>
                              <span className="font-semibold text-sm">{item.impact}</span>
                            </div>

                            {/* Action Button */}
                            <Link
                              href={item.link || '#'}
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                            >
                              Learn More
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                  <Link
                    href="/initiatives"
                    className="inline-flex items-center bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
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

        {/* Features Section */}
        <section className="py-20 bg-gray-100 border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Why Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Commitments
              </h2>
              <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
                We believe in transparency, community engagement, and creating sustainable impact
                through innovative approaches and dedicated service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
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
                    className={`group text-center bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 ${colors.bgLight}`}
                  >
                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-xl ${colors.bg} flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Border Effect */}
                    <div className={`absolute inset-0 rounded-xl border-2 ${colors.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recent Events Section */}
        <section className="py-20 bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-16">
              <div>
                <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  Latest Updates
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Recent Events
                </h2>
              </div>
              <Link
                href="/events"
                className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-bold text-lg transition-colors duration-300"
              >
                View All Events
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>

            {eventError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span>{eventError}</span>
                </div>
              </div>
            )}
            {events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden"
                  >
                    <div className="p-8">
                      {/* Date Badge */}
                      <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-6">
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {event.startDate?.toLocaleDateString?.() || 'Date TBD'}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-700 transition-colors duration-300">
                        {event.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {event.description}
                      </p>

                      {/* Location if available */}
                      {event.location && (
                        <div className="flex items-center text-gray-500 text-sm font-medium">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-8">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recent Events</h3>
                <p className="text-gray-700 max-w-md mx-auto">
                  Stay tuned for upcoming community events and activities that make a difference.
                </p>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/events"
                className="inline-flex items-center bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Explore All Events
                <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        {gallery.length > 0 && (
          <section className="py-20 bg-white border-b border-gray-200">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <div className="inline-block bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow">
                  Visual Stories
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-6 drop-shadow">
                  Moments That Matter
                </h2>
                <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
                  Capturing the joy, hope, and transformation in our community through powerful visual storytelling
                </p>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                {gallery.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="group relative w-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    {/* Loading spinner */}
                    {galleryImageStates[index] && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    )}

                    {/* Error fallback */}
                    {galleryImageErrors[index] ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-12 h-12 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p className="text-sm">Gallery Image</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={image.url}
                        alt={image.caption || `Gallery image ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                        onLoad={() => handleGalleryImageLoad(index)}
                        onError={() => handleGalleryImageError(index)}
                        loading="lazy"
                      />
                    )}

                    {/* Overlay - only show when image is loaded */}
                    {!galleryImageStates[index] && !galleryImageErrors[index] && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300"></div>
                    )}
                    
                    {/* Caption */}
                    {image.caption && !galleryImageStates[index] && !galleryImageErrors[index] && (
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <p className="text-sm font-medium bg-black/70 rounded px-3 py-2">
                          {image.caption}
                        </p>
                      </div>
                    )}

                    {/* Zoom Icon */}
                    {!galleryImageStates[index] && !galleryImageErrors[index] && (
                      <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/gallery"
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors duration-300 shadow-xl hover:shadow-2xl"
                >
                  <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Explore Full Gallery
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        <Testimonials customTestimonials={testimonials} variant="default" />

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white relative overflow-hidden">
          <div className="container mx-auto px-6 py-20 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-green-400 to-blue-400 bg-opacity-30 text-white px-6 py-3 rounded-full text-lg font-semibold mb-8 shadow">
                Join Our Mission
              </div>

              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 drop-shadow">
                Ready to Make a Real Difference?
              </h2>

              <p className="text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Your support can help us expand our reach and touch more lives. Get involved today
                and be part of the change you want to see in the world.
              </p>

              {/* Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-white/10 to-blue-200/10 rounded-lg p-8 border border-white border-opacity-20 shadow">
                  <div className="text-4xl font-bold text-white mb-3">₹1 = 1 Meal</div>
                  <div className="text-gray-300 font-medium">Your donation impact</div>
                  <div className="w-full h-1 bg-green-400 rounded-full mt-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-green-200/10 rounded-lg p-8 border border-white border-opacity-20 shadow">
                  <div className="text-4xl font-bold text-white mb-3">100% Direct</div>
                  <div className="text-gray-300 font-medium">No administrative fees</div>
                  <div className="w-full h-1 bg-blue-400 rounded-full mt-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-purple-200/10 rounded-lg p-8 border border-white border-opacity-20 shadow">
                  <div className="text-4xl font-bold text-white mb-3">24hr Impact</div>
                  <div className="text-gray-300 font-medium">Immediate community help</div>
                  <div className="w-full h-1 bg-purple-400 rounded-full mt-4"></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16">
                <Link
                  href="/donate"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-6 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center text-xl"
                >
                  <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Donate Now
                </Link>
                <Link
                  href="/volunteer"
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-6 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center text-xl border-2 border-white"
                >
                  <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Become a Volunteer
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-300 font-medium">
                <div className="flex items-center bg-white bg-opacity-10 rounded-full px-4 py-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Registered NGO
                </div>
                <div className="flex items-center bg-white bg-opacity-10 rounded-full px-4 py-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Transparent Operations
                </div>
                <div className="flex items-center bg-white bg-opacity-10 rounded-full px-4 py-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  Community Verified
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Share Your Story Modal */}
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-6 relative">
              <button
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowStoryModal(false)}
              >
                ×
              </button>

              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Share Your Story
                </h3>
                <p className="text-gray-600 text-lg">
                  Your experience matters. Help inspire others by sharing how our community has impacted your life.
                </p>
              </div>

              <form onSubmit={handleStorySubmit} className="space-y-6">
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