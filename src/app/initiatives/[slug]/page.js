"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";

function InitiativeDetailPage() {
  const { slug } = useParams();
  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchInitiative = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch by slug field
        const q = query(collection(db, "initiatives"), where("slug", "==", slug));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setInitiative({ id: docSnap.id, ...docSnap.data() });
        } else {
          // fallback: try by id
          const docRef = doc(db, "initiatives", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setInitiative({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError("Initiative not found.");
            setInitiative(null);
          }
        }
      } catch (err) {
        setError("Failed to load initiative.");
        setInitiative(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchInitiative();
  }, [slug]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="mt-4 text-gray-600 font-medium">Loading initiative details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Initiative Not Found</h1>
            <p className="text-gray-600 mb-8">The initiative you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
            <Link 
              href="/initiatives" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
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

  const mainImage = initiative.imageUrl || initiative.image?.url || initiative.bannerImage;
  const categoryColors = {
    'food-security': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    'education': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'basic-needs': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'environment': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };
  
  const colors = categoryColors[initiative.category] || categoryColors.default;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6 ${colors.bg} ${colors.text} ${colors.border} border`}>
              {initiative.category ? initiative.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Initiative'}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {initiative.title || initiative.name}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {initiative.description}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Main Image */}
              {mainImage && (
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative" style={{ aspectRatio: '16 / 9' }}>
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    
                    {imageError ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">
                            {initiative.category === 'food-security' ? '🍽️' : 
                             initiative.category === 'education' ? '📚' : 
                             initiative.category === 'basic-needs' ? '🛡️' : '🌱'}
                          </div>
                          <p className="text-xl font-semibold">{initiative.title || initiative.name}</p>
                          <p className="text-blue-200">Initiative Image</p>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={mainImage}
                        alt={initiative.title || initiative.name}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        onClick={() => openLightbox(mainImage)}
                        priority
                      />
                    )}
                  </div>
                  {!imageLoading && !imageError && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer">
                      <div className="bg-white/90 rounded-full p-3">
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Description */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Initiative</h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {initiative.longDescription ? (
                    <div dangerouslySetInnerHTML={{ __html: initiative.longDescription }} />
                  ) : (
                    <p>{initiative.description}</p>
                  )}
                </div>
              </div>

              {/* Key Features */}
              {initiative.features && initiative.features.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {initiative.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {initiative.gallery && initiative.gallery.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {initiative.gallery.map((image, idx) => (
                      <div 
                        key={idx}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(image.url)}
                      >
                        <Image
                          src={image.url}
                          alt={image.caption || `Gallery image ${idx + 1}`}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2">
                            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Impact Stats */}
              {initiative.impact && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Impact Achieved</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {typeof initiative.impact === 'string' ? initiative.impact : `${initiative.impact.number} ${initiative.impact.metric}`}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {typeof initiative.impact === 'object' && initiative.impact.description}
                    </div>
                    <div className="mt-4 bg-blue-50 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3m-3 0H0m4 20V5a2 2 0 012-2h6a2 2 0 012 2v15"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="font-semibold text-gray-900">
                        {initiative.category ? initiative.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Community Initiative'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-semibold text-gray-900">Vadodara, Gujarat</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-semibold text-green-600">Active</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Get Involved</h3>
                <p className="text-blue-100 mb-6">
                  Support this initiative and help us make a bigger impact in our community.
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/donate" 
                    className="w-full bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 text-center block"
                  >
                    Donate Now
                  </Link>
                  <Link 
                    href="/volunteer" 
                    className="w-full border-2 border-white/50 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 text-center block"
                  >
                    Become a Volunteer
                  </Link>
                </div>
              </div>

              {/* Back Link */}
              <div className="text-center">
                <Link 
                  href="/initiatives" 
                  className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to All Initiatives
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

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
              alt="Initiative image"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InitiativeDetailPage;