// Enhanced src/app/gallery/page.js
'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, where, limit, startAfter } from 'firebase/firestore';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Use a ref for the last document to avoid re-render loops
  const lastDocRef = useRef(null);
  const sentinelRef = useRef(null);

  const IMAGES_PER_PAGE = 12;

  const categories = useMemo(() => {
    const allCategories = new Set(images.map(image => image.category).filter(Boolean));
    const uniqueCategories = [
      { id: 'all', name: 'All Photos', icon: '🖼️' },
      ...Array.from(allCategories).map(cat => ({
        id: cat,
        name: cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: '📷'
      }))
    ];
    return uniqueCategories;
  }, [images]);

  const fetchImages = async (isLoadMore = false, category = selectedCategory) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setImages([]);
        lastDocRef.current = null; // Reset ref
        setHasMore(true);
      } else {
        if (!hasMore || loadingMore) return; // Prevent multiple fetches
        setLoadingMore(true);
      }

      let q;
      const galleryCollection = collection(db, 'gallery');

      if (category === 'all') {
        q = query(
          galleryCollection,
          orderBy('uploadedAt', 'desc'),
          ...(isLoadMore && lastDocRef.current ? [startAfter(lastDocRef.current)] : []),
          limit(IMAGES_PER_PAGE)
        );
      } else {
        q = query(
          galleryCollection,
          where('category', '==', category),
          orderBy('uploadedAt', 'desc'),
          ...(isLoadMore && lastDocRef.current ? [startAfter(lastDocRef.current)] : []),
          limit(IMAGES_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const imageData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        caption: doc.data().caption || '',
        category: doc.data().category || 'general',
        uploadedAt: doc.data().uploadedAt || null
      }));

      setImages(prev => (isLoadMore ? [...prev, ...imageData] : imageData));
      
      if (querySnapshot.docs.length < IMAGES_PER_PAGE) {
        setHasMore(false);
      }

      if (querySnapshot.docs.length > 0) {
        lastDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1];
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching images: ", err);
      setError("Failed to load gallery images. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Effect for fetching on category change
  useEffect(() => {
    fetchImages(false, selectedCategory);
  }, [selectedCategory]);

  // Infinite scroll observer effect
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchImages(true, selectedCategory);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loadingMore, selectedCategory]);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    return images.filter(image =>
      image.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [images, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const openLightbox = (image) => {
    setSelectedImg(image);
    if (typeof window !== 'undefined' && document?.body) {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setSelectedImg(null);
    if (typeof window !== 'undefined' && document?.body) {
      document.body.style.overflow = 'auto';
    }
  };

  const navigateImage = (direction) => {
    if (!selectedImg) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImg.id);
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }
    setSelectedImg(filteredImages[newIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImg) return;
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImg, filteredImages]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-20">
            <h1 className="text-5xl font-bold">Gallery</h1>
            <p className="text-xl mt-4">A Glimpse Into Our Work</p>
          </header>
          <div className="container mx-auto px-6 py-16 text-center">
            <LoadingSpinner size="xl" />
            <p className="text-gray-500 mt-4">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20">
          <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-20">
            <h1 className="text-5xl font-bold">Gallery</h1>
            <p className="text-xl mt-4">A Glimpse Into Our Work</p>
          </header>
          <div className="container mx-auto px-6 py-16 text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Unable to Load Gallery</h3>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchImages(false, selectedCategory)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                Try Again
              </button>
            </div>
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
        <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">Our Gallery</h1>
            <p className="text-xl mb-6">Capturing moments of hope, compassion, and community impact</p>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{images.length}+</div>
                    <div className="text-sm opacity-90">Photos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm opacity-90">Events</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-sm opacity-90">Stories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-sm opacity-90">Years</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search photos by caption or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-md"
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

          {filteredImages.length > 0 ? (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="relative w-full">
                      <Image
                        src={image.url}
                        alt={image.caption || `Gallery image ${index + 1}`}
                        width={500}
                        height={500}
                        className="w-full h-auto rounded-lg group-hover:brightness-110 transition-all duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                        </div>
                      </div>
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                          {image.uploadedAt?.toDate && (
                            <p className="text-white/70 text-xs mt-1">
                              {new Date(image.uploadedAt.toDate()).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {categories.find(cat => cat.id === image.category)?.name || 'Gallery'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && !searchQuery && (
                <div ref={sentinelRef} className="text-center mt-12 h-10">
                  {loadingMore && (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" color="orange" />
                      <span className="text-orange-500">Loading more...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Photos Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No photos match "${searchQuery}". Try a different search term.`
                    : `No photos available in the ${categories.find(cat => cat.id === selectedCategory)?.name} category yet.`
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {selectedImg && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors duration-200 z-60 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
                aria-label="Close lightbox"
              >
                &times;
              </button>
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
              <div className="flex flex-col items-center">
                <Image
                  src={selectedImg.url}
                  alt={selectedImg.caption || 'Gallery image'}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  priority
                />
                {selectedImg.caption && (
                  <div className="bg-black/70 text-white p-4 rounded-lg mt-4 max-w-2xl text-center">
                    <p className="text-lg font-medium">{selectedImg.caption}</p>
                    {selectedImg.uploadedAt?.toDate && (
                      <p className="text-sm text-gray-300 mt-2">
                        {new Date(selectedImg.uploadedAt.toDate()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}
                {filteredImages.length > 1 && (
                  <div className="text-white mt-2 text-sm">
                    {filteredImages.findIndex(img => img.id === selectedImg.id) + 1} of {filteredImages.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;