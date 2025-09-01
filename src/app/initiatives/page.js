// Initiatives Listing Page - Redesigned
'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_IMAGES = {
  'food-security': '/images/fallbacks/food-security.jpg',
  'education': '/images/fallbacks/education.jpg',
  'basic-needs': '/images/fallbacks/basic-needs.jpg',
  'environment': '/images/fallbacks/environment.jpg',
  'default': '/images/fallbacks/default.jpg'
};

const InitiativesPage = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    { id: 'all', label: 'All Initiatives', icon: '🎯' },
    { id: 'food-security', label: 'Food Security', icon: '🍽️' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'basic-needs', label: 'Basic Needs', icon: '🏠' },
    { id: 'environment', label: 'Environment', icon: '🌱' }
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'alphabetical', label: 'A-Z' }
  ];

  useEffect(() => {
    const fetchInitiatives = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'initiatives'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const initiativesData = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          name: doc.data().title || doc.data().name || 'Untitled Initiative'
        }));
        setInitiatives(initiativesData);
        setFilteredInitiatives(initiativesData);
      } catch (err) {
        console.error('Error fetching initiatives:', err);
        setError('Failed to load initiatives.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

  useEffect(() => {
    let filtered = initiatives;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(initiative =>
        initiative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (initiative.description && initiative.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(initiative => initiative.category === selectedCategory);
    }

    // Sort initiatives
    switch (sortBy) {
      case 'oldest':
        filtered = [...filtered].reverse();
        break;
      case 'alphabetical':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        break;
    }

    setFilteredInitiatives(filtered);
  }, [initiatives, searchQuery, selectedCategory, sortBy]);

  const handleImageError = (initiativeId, category) => {
    setImageErrors(prev => ({ ...prev, [initiativeId]: true }));
  };

  const getFallbackImage = (category) => {
    return FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  };

  // Improved color scheme for better contrast
  const getCategoryColors = (category) => {
    const colorMap = {
      'food-security': 'bg-green-600 text-white',
      'education': 'bg-blue-600 text-white',
      'basic-needs': 'bg-purple-600 text-white',
      'environment': 'bg-emerald-600 text-white',
      'default': 'bg-gray-600 text-white'
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
              <span className="text-gray-700 font-semibold text-lg">Loading initiatives...</span>
            </div>
            <p className="text-gray-500">Discovering amazing community programs</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Initiatives</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-teal-600 hover:bg-gray-700 text-black px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-100 via-cyan-100 to-blue-100 text-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/60 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-full font-bold mb-8">
              Community Impact Programs
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Our <span className="text-yellow-500">Initiatives</span>
            </h1>
            <p className="text-xl md:text-2xl text-teal-800 max-w-3xl mx-auto leading-relaxed mb-8">
              Discover the community programs making a real difference in people&apos;s lives. 
              Each initiative represents our commitment to positive change.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-yellow-300 mr-2">🎯</span>
                <span className="font-semibold">{initiatives.length} Active Programs</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-yellow-300 mr-2">❤️</span>
                <span className="font-semibold">Community Driven</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-yellow-300 mr-2">✨</span>
                <span className="font-semibold">100% Transparent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Filters & Search */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search initiatives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors duration-200"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-600'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline">{category.label}</span>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors duration-200 font-semibold"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <span className="font-semibold">
                {filteredInitiatives.length} initiative{filteredInitiatives.length !== 1 ? 's' : ''} found
              </span>
              {searchQuery && (
                <span className="ml-2">
                  for <span className="font-semibold text-teal-600">{searchQuery}</span>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="ml-2">
                  in <span className="font-semibold text-teal-600">
                    {categories.find(c => c.id === selectedCategory)?.label}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Initiatives Grid */}
          {filteredInitiatives.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto bg-gray-200 rounded-3xl flex items-center justify-center mb-8">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No initiatives found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Try adjusting your search terms or category filters to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInitiatives.map((initiative) => (
                <div
                  key={initiative.id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {imageErrors[initiative.id] ? (
                      <div className={`w-full h-full flex items-center justify-center ${getCategoryColors(initiative.category)}`}>
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {initiative.category === 'food-security' ? '🍽️' :
                             initiative.category === 'education' ? '📚' :
                             initiative.category === 'basic-needs' ? '🏠' :
                             initiative.category === 'environment' ? '🌱' : '🎯'}
                          </div>
                          <p className="font-bold text-sm opacity-90">Initiative</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={initiative.imageUrl || initiative.image?.url || getFallbackImage(initiative.category)}
                        alt={initiative.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(initiative.id, initiative.category)}
                      />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    {initiative.category && (
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getCategoryColors(initiative.category)}`}>
                          {initiative.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}

                    {/* Featured Badge */}
                    {initiative.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Impact Badge */}
                    {initiative.impact && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg shadow-lg">
                          <span className="text-xs font-bold">
                            {typeof initiative.impact === 'string' 
                              ? initiative.impact 
                              : `${initiative.impact.number} ${initiative.impact.metric}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2">
                      {initiative.name}
                    </h2>
                    <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
                      {initiative.description || 'Learn more about this community initiative and its impact.'}
                    </p>

                    {/* Action Button */}
                    <Link
                      href={`/initiatives/${initiative.slug || initiative.id}`}
                      className="group/btn inline-flex items-center w-full justify-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>Learn More</span>
                      <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {filteredInitiatives.length > 0 && (
            <div className="mt-20 text-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white rounded-3xl p-12">
              <h3 className="text-3xl font-bold mb-4 text-teal-400">Get Involved Today</h3>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Every initiative thrives on community support. Your contribution can make a real difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/donate"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Support Our Cause
                </Link>
                <Link
                  href="/volunteer"
                  className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-bold transition-all duration-200"
                >
                  Volunteer With Us
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InitiativesPage;