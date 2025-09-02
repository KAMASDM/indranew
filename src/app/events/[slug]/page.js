'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

const EventDetailPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingImages, setLoadingImages] = useState({});
  const imagesPerPage = 6; // Show 6 images per page
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;

      try {
        let foundEvent = null;
        // First, query by slug if it exists
        const q = query(collection(db, 'events'), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          foundEvent = { id: doc.id, ...doc.data() };
        } else {
          // Fallback to fetching by ID
          const docRef = doc(db, 'events', slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            foundEvent = { id: docSnap.id, ...docSnap.data() };
          }
        }

        if (foundEvent) {
          setEvent(foundEvent);
          setCurrentPage(1); // Reset to first page when event changes
          setLoadingImages({}); // Reset loading states
          setImageErrors({}); // Reset error states
          // Debug: Log image URLs
          if (foundEvent.images) {
            console.log('Event images:', foundEvent.images);
            foundEvent.images.forEach((img, idx) => {
              console.log(`Image ${idx}:`, img.url);
            });
          }
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

  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handleImageError = (index, error) => {
    console.error(`Image ${index} failed to load:`, error);
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
    setLoadingImages(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleImageLoad = (index) => {
    console.log(`Image ${index} loaded successfully`);
    setLoadingImages(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleImageLoadStart = (index) => {
    setLoadingImages(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Pagination logic
  const totalImages = event?.images?.length || 0;
  const totalPages = Math.ceil(totalImages / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = event?.images?.slice(startIndex, endIndex) || [];

  const goToPage = (page) => {
    setCurrentPage(page);
    // Scroll to gallery section when changing pages
    const gallerySection = document.getElementById('event-gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
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
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/events" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300">
              View All Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = event.startDate ? new Date(event.startDate) : new Date();
  const isUpcoming = eventDate > new Date();

  // Split description into paragraphs
  const descriptionParagraphs = event.description ? event.description.split('\n').filter(p => p.trim() !== '') : [];

  return (
    <div className="bg-cyan-50 min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {event.category || 'Community Event'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                {event.name}
              </h1>
              <p className="text-xl text-orange-100">
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Main Content */}
            <article className="lg:col-span-2">
              <div className="prose lg:prose-xl max-w-none mb-12">
                {descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-lg text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    An amazing event by the Indraprasth Foundation to serve our community in Vadodara.
                  </p>
                )}
              </div>

              {/* Image Gallery */}
              {event.images && event.images.length > 0 && (
                <section id="event-gallery">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Event Gallery</h2>
                    {totalPages > 1 && (
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalImages)} of {totalImages} images
                      </div>
                    )}
                  </div>
                  
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {currentImages.map((img, idx) => {
                      const actualIndex = startIndex + idx; // Get the actual index for tracking
                      return (
                        <div
                          key={actualIndex}
                          className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
                          onClick={() => !imageErrors[actualIndex] && !loadingImages[actualIndex] && openLightbox(img.url)}
                          style={{ aspectRatio: '1 / 1' }}
                        >
                          {imageErrors[actualIndex] ? (
                            // Fallback UI for failed images
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <div className="text-center p-4">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p className="text-sm text-gray-500">Image unavailable</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Loading skeleton */}
                              {loadingImages[actualIndex] && (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                </div>
                              )}
                              
                              <Image
                                src={img.url}
                                alt={img.name || `Event image ${actualIndex + 1}`}
                                width={400}
                                height={400}
                                className="w-full h-full object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                onLoadingComplete={() => handleImageLoad(actualIndex)}
                                onError={() => handleImageError(actualIndex, 'Failed to load')}
                                onLoadStart={() => handleImageLoadStart(actualIndex)}
                                priority={currentPage === 1 && idx < 3} // Prioritize first 3 images on first page
                                loading={currentPage === 1 && idx < 3 ? "eager" : "lazy"} // Lazy load images not on first page
                              />
                            </>
                          )}
                          
                          {/* Hover overlay */}
                          {!imageErrors[actualIndex] && !loadingImages[actualIndex] && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                              <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      {/* Previous Button */}
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg border border-gray-200'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          const showPage = 
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          const showEllipsis = 
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 && currentPage < totalPages - 2);

                          if (!showPage && !showEllipsis) return null;

                          if (showEllipsis) {
                            return (
                              <span key={`ellipsis-${page}`} className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                currentPage === page
                                  ? 'bg-orange-500 text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg border border-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-lg border border-gray-200'
                        }`}
                      >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky top-24 self-start">
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Event Details</h3>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Date & Time</h4>
                    <p className="text-gray-600">{eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     <p className="text-sm text-gray-500">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                 <div className="flex items-start space-x-4">
                   <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-700">Location</h4>
                     <p className="text-gray-600">{event.location || 'Vadodara, Gujarat'}</p>
                      {event.mapUrl && (
                        <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-600 hover:underline">View on Map</a>
                      )}
                   </div>
                 </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isUpcoming
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isUpcoming ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4 text-center">Get Involved</h4>
                  <div className="flex flex-col space-y-3">
                    <Link href="/donate" className="w-full text-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300 font-semibold">
                      Support Our Cause
                    </Link>
                     <Link href="/volunteer" className="w-full text-center border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-500 hover:text-white transition duration-300 font-semibold">
                      Volunteer With Us
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                 <Link
                  href="/events"
                  className="inline-flex items-center text-gray-600 hover:text-orange-600 font-medium group"
                >
                   <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Back to All Events
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute top-0 right-0 m-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
              aria-label="Close image view"
            >
              &times;
            </button>
            <Image
              src={selectedImage}
              alt="Event image"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              unoptimized={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;