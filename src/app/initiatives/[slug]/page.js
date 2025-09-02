// Initiative Detail Page - Fully Integrated with Admin Fields
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

function InitiativeDetailPage() {
  const { slug } = useParams();
  const [initiative, setInitiative] = useState(null);
  const [relatedInitiatives, setRelatedInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);

  useEffect(() => {
    const fetchInitiative = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch by slug field
        const q = query(collection(db, 'initiatives'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const initiativeData = { id: docSnap.id, ...docSnap.data() };
          setInitiative(initiativeData);
          
          // Fetch related initiatives
          if (initiativeData.category) {
            const relatedQuery = query(
              collection(db, 'initiatives'), 
              where('category', '==', initiativeData.category)
            );
            const relatedSnapshot = await getDocs(relatedQuery);
            const related = relatedSnapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(item => item.id !== initiativeData.id)
              .slice(0, 3);
            setRelatedInitiatives(related);
          }
        } else {
          // fallback: try by id
          const docRef = doc(db, 'initiatives', slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setInitiative({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError('Initiative not found.');
            setInitiative(null);
          }
        }
      } catch (err) {
        console.error('Error fetching initiative:', err);
        setError('Failed to load initiative.');
        setInitiative(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchInitiative();
  }, [slug]);

  // Handle multiple main images
  const getMainImages = () => {
    if (!initiative) return [];
    
    // Handle array of images
    if (Array.isArray(initiative.imageUrl)) {
      return initiative.imageUrl.filter(Boolean);
    }
    
    // Handle single image (string)
    if (typeof initiative.imageUrl === 'string' && initiative.imageUrl) {
      return [initiative.imageUrl];
    }
    
    // Handle legacy fields
    if (initiative.image?.url) return [initiative.image.url];
    if (initiative.bannerImage) return [initiative.bannerImage];
    
    return [];
  };

  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  // Improved color scheme for better contrast
  const getCategoryColors = (category) => {
    const colorMap = {
      'food-security': {
        bg: 'bg-green-600',
        text: 'text-green-900',
        bgLight: 'bg-green-50',
        button: 'bg-green-500 hover:bg-green-700 text-white',
        buttonOutline: 'border-green-600 text-green-700 hover:bg-green-600 hover:text-white'
      },
      'education': {
        bg: 'bg-blue-600',
        text: 'text-blue-900',
        bgLight: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-700 text-white',
        buttonOutline: 'border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white'
      },
      'basic-needs': {
        bg: 'bg-purple-600',
        text: 'text-purple-900',
        bgLight: 'bg-purple-50',
        button: 'bg-purple-500 hover:bg-purple-700 text-white',
        buttonOutline: 'border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white'
      },
      'environment': {
        bg: 'bg-emerald-600',
        text: 'text-emerald-900',
        bgLight: 'bg-emerald-50',
        button: 'bg-emerald-500 hover:bg-emerald-700 text-white',
        buttonOutline: 'border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white'
      },
      'default': {
        bg: 'bg-gray-600',
        text: 'text-gray-900',
        bgLight: 'bg-gray-50',
        button: 'bg-gray-500 hover:bg-gray-700 text-white',
        buttonOutline: 'border-gray-600 text-gray-700 hover:bg-gray-600 hover:text-white'
      }
    };
    return colorMap[category] || colorMap.default;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 bg-white rounded-2xl shadow-xl px-8 py-6 mb-8">
              <LoadingSpinner size="lg" />
              <span className="text-gray-700 font-semibold text-lg">Loading initiative details...</span>
            </div>
            <p className="text-gray-500">Gathering program information</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-32 h-32 mx-auto bg-red-100 rounded-3xl flex items-center justify-center mb-8">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Initiative Not Found</h1>
            <p className="text-gray-600 mb-8">The initiative you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
            <Link 
              href="/initiatives" 
              className="inline-flex items-center bg-teal-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to All Initiatives
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const mainImages = getMainImages();
  const colors = getCategoryColors(initiative.category);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'impact', label: 'Impact', icon: '📊' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'get-involved', label: 'Get Involved', icon: '🤝' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-100 via-cyan-100 to-blue-100 text-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${colors.bg} text-white shadow-lg`}>
                    {initiative.category ? initiative.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Initiative'}
                  </span>
                  {initiative.featured && (
                    <span className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold shadow-lg">
                      Featured Program
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-gray-900">
                  {initiative.title || initiative.name}
                </h1>
                <p className="text-xl mb-8 leading-relaxed text-gray-800">
                  {initiative.description}
                </p>
                
                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/80 rounded-2xl p-4">
                    <div className="text-2xl font-bold text-gray-900">Active</div>
                    <div className="text-teal-700 text-sm">Status</div>
                  </div>
                  {initiative.impact && (
                    <div className="bg-white/80 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {typeof initiative.impact === 'object' && initiative.impact.number 
                          ? initiative.impact.number 
                          : typeof initiative.impact === 'string' 
                            ? initiative.impact.split(' ')[0]
                            : 'Growing'}
                      </div>
                      <div className="text-teal-700 text-sm">
                        {typeof initiative.impact === 'object' && initiative.impact.metric 
                          ? initiative.impact.metric
                          : typeof initiative.impact === 'string' 
                            ? initiative.impact.split(' ').slice(1).join(' ')
                            : 'Impact'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Image Section - Handle Multiple Images */}
              <div className="relative">
                <div className="relative bg-white/80 rounded-3xl p-4">
                  {mainImages.length > 0 ? (
                    <div className="relative">
                      {/* Main Image Display */}
                      <div className="relative rounded-2xl overflow-hidden aspect-video">
                        <Image
                          src={mainImages[currentMainImageIndex]}
                          alt={initiative.title || initiative.name}
                          fill
                          className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => openLightbox(mainImages[currentMainImageIndex])}
                          priority
                        />
                      </div>
                      
                      {/* Image Navigation for Multiple Images */}
                      {mainImages.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                          {mainImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentMainImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentMainImageIndex 
                                  ? 'bg-teal-600' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Image Counter */}
                      {mainImages.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {currentMainImageIndex + 1} of {mainImages.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback when no images
                    <div className={`rounded-2xl overflow-hidden aspect-video ${colors.bg} flex items-center justify-center`}>
                      <div className="text-center text-white">
                        <div className="text-6xl mb-4">
                          {initiative.category === 'food-security' ? '🍽️' : 
                           initiative.category === 'education' ? '📚' : 
                           initiative.category === 'basic-needs' ? '🏠' : '🌱'}
                        </div>
                        <p className="text-xl font-bold">{initiative.title || initiative.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-2 mb-12 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? `${colors.button}`
                      : `border-2 ${colors.buttonOutline} bg-white`
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Detailed Description */}
                  <div className="bg-white rounded-3xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Initiative</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      {initiative.longDescription ? (
                        <div dangerouslySetInnerHTML={{ __html: initiative.longDescription }} />
                      ) : (
                        <p className="text-lg leading-relaxed">{initiative.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Key Features - Enhanced */}
                  {initiative.features && initiative.features.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-lg p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
                      <div className="grid md:grid-cols-1 gap-4">
                        {initiative.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <p className="text-gray-800 font-semibold flex-1">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'impact' && (
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Impact Metrics</h2>
                  
                  {initiative.impact ? (
                    <div className="space-y-8">
                      {/* Primary Impact Display */}
                      <div className="text-center">
                        <div className="text-6xl font-black text-teal-600 mb-4">
                          {typeof initiative.impact === 'object' && initiative.impact.number
                            ? initiative.impact.number
                            : typeof initiative.impact === 'string' 
                              ? initiative.impact 
                              : 'Growing Impact'}
                        </div>
                        
                        {typeof initiative.impact === 'object' && (
                          <>
                            {initiative.impact.metric && (
                              <div className="text-2xl font-bold text-gray-800 mb-2">
                                {initiative.impact.metric}
                              </div>
                            )}
                            {initiative.impact.description && (
                              <p className="text-gray-600 max-w-2xl mx-auto">
                                {initiative.impact.description}
                              </p>
                            )}
                          </>
                        )}
                        
                        <div className="mt-6 bg-teal-100 rounded-full h-4 max-w-md mx-auto">
                          <div className="bg-teal-600 h-4 rounded-full animate-pulse" style={{width: '75%'}}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Impact Data Coming Soon</h3>
                      <p className="text-gray-600">
                        {initiative && initiative.impact !== undefined
                          ? "We're working on compiling detailed impact metrics for this initiative."
                          : "Impact information is currently unavailable."}
                      </p>
                    </div>
                  )}

                  {/* Additional Impact Stats */}
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">Active</div>
                      <div className="text-blue-800 font-semibold">Program Status</div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-200">
                      <div className="text-3xl font-bold text-green-600">Community</div>
                      <div className="text-green-800 font-semibold">Driven Initiative</div>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-6 text-center border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">Vadodara</div>
                      <div className="text-purple-800 font-semibold">Based Program</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
                  
                  {initiative.gallery && initiative.gallery.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {initiative.gallery.map((image, idx) => (
                        <div key={idx} className="space-y-3">
                          <div 
                            className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(image.url)}
                          >
                            <Image
                              src={image.url}
                              alt={image.caption || `Gallery image ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-3 shadow-lg">
                                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                          {/* Display Caption if Available */}
                          {image.caption && (
                            <p className="text-sm text-gray-600 text-center px-2">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🖼️</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Gallery Images</h3>
                      <p className="text-gray-600">Gallery images for this initiative will be added soon.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'get-involved' && (
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Get Involved</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200">
                      <h3 className="text-xl font-bold text-teal-800 mb-4">Support This Initiative</h3>
                      <p className="text-teal-700 mb-6">
                        Your donation directly supports this program and helps us expand our impact in the community.
                      </p>
                      <Link 
                        href="/donate" 
                        className={`inline-flex items-center ${colors.button} px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-lg`}
                      >
                        <span className="mr-2">❤️</span>
                        Donate Now
                      </Link>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h3 className="text-xl font-bold text-blue-800 mb-4">Volunteer With Us</h3>
                      <p className="text-blue-700 mb-6">
                        Join our team of dedicated volunteers and contribute your time and skills to make a difference.
                      </p>
                      <Link 
                        href="/volunteer" 
                        className={`inline-flex items-center border-2 ${colors.buttonOutline} px-6 py-3 rounded-xl font-bold transition-colors duration-300 shadow-lg`}
                      >
                        <span className="mr-2">🤝</span>
                        Become a Volunteer
                      </Link>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                      <h3 className="text-xl font-bold text-green-800 mb-4">Spread the Word</h3>
                      <p className="text-green-700 mb-6">
                        Help us reach more people by sharing this initiative with your network.
                      </p>
                      <div className="flex gap-4">
                        <button className="flex items-center bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-300">
                          <span className="mr-2">📱</span>
                          Share
                        </button>
                        <button 
                          onClick={() => navigator.clipboard.writeText(window.location.href)}
                          className="flex items-center border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-300"
                        >
                          <span className="mr-2">🔗</span>
                          Copy Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Info */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3m-3 0H0m4 20V5a2 2 0 012-2h6a2 2 0 012 2v15"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-semibold">Category</div>
                      <div className="font-bold text-gray-900">
                        {initiative.category ? initiative.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Community Initiative'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-semibold">Location</div>
                      <div className="font-bold text-gray-900">Vadodara, Gujarat</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-semibold">Status</div>
                      <div className="font-bold text-green-600">Active Program</div>
                    </div>
                  </div>

                  {/* Additional Info for Multiple Images */}
                  {mainImages.length > 1 && (
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">Images</div>
                        <div className="font-bold text-gray-900">{mainImages.length} Photos</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Initiatives */}
              {relatedInitiatives.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Initiatives</h3>
                  <div className="space-y-4">
                    {relatedInitiatives.map((related) => (
                      <Link
                        key={related.id}
                        href={`/initiatives/${related.slug || related.id}`}
                        className="block p-4 rounded-2xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 group"
                      >
                        <h4 className="font-bold text-gray-900 group-hover:text-teal-700 mb-2">
                          {related.title || related.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {related.description}
                        </p>
                        {related.featured && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                            Featured
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Link */}
              <div className="text-center">
                <Link 
                  href="/initiatives" 
                  className="inline-flex items-center text-gray-600 hover:text-teal-600 font-semibold transition-colors duration-300 group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to All Initiatives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="relative max-w-6xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-2xl rounded-full flex items-center justify-center transition-all duration-200 z-10"
              aria-label="Close image view"
            >
              ×
            </button>
            <Image
              src={selectedImage}
              alt="Initiative image"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InitiativeDetailPage;