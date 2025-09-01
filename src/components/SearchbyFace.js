'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import * as faceapi from 'face-api.js';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

// Helper function to load models from face-api.js
const loadModels = async () => {
  const MODEL_URL = '/models'; // Models must be in the /public/models directory
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    console.log("Face models loaded successfully.");
    return true;
  } catch (error) {
    console.error("Error loading face models:", error);
    return false;
  }
};

const SearchYourImagePage = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, status: '' });
  const imageInputRef = useRef(null);

  useEffect(() => {
    loadModels().then(setModelsLoaded);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setUserImagePreview(URL.createObjectURL(file));
      setError('');
      setResults([]);
      setSearchAttempted(false);
    }
  };
  
  const fetchAllImageUrls = async () => {
    const urls = new Set();
    const collectionsToSearch = ['gallery', 'events'];

    for (const coll of collectionsToSearch) {
        const q = query(collection(db, coll));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            const data = doc.data();
            if (coll === 'gallery' && data.url) {
                urls.add({ url: data.url, link: '/gallery' });
            }
            if (coll === 'events' && data.images && Array.isArray(data.images)) {
                data.images.forEach(img => {
                    if (img.url) {
                        urls.add({ url: img.url, link: `/events/${doc.id}` });
                    }
                });
            }
        });
    }
    
    return Array.from(urls);
  };

  const handleSearch = async () => {
    if (!userImage || !modelsLoaded) {
      setError('Please upload an image and wait for models to load.');
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);
    setError('');
    setResults([]);
    setSearchProgress({ current: 0, total: 0, status: 'Initializing search...' });

    let allImages = [];

    try {
      const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      
      setSearchProgress(prev => ({ ...prev, status: 'Analyzing your photo...' }));
      const userImgElement = await faceapi.bufferToImage(userImage);
      const userDetections = await faceapi.detectSingleFace(userImgElement, detectorOptions).withFaceLandmarks().withFaceDescriptor();

      if (!userDetections) {
        setError("Could not detect a face in your uploaded image. Please try a clearer picture.");
        setIsSearching(false);
        return;
      }
      
      const faceMatcher = new faceapi.FaceMatcher([userDetections.descriptor], 0.54);
      
      setSearchProgress(prev => ({ ...prev, status: 'Fetching all event and gallery photos...' }));
      allImages = await fetchAllImageUrls();
      if (allImages.length === 0) {
          setError("No images found in the gallery or events to search through.");
          setIsSearching(false);
          return;
      }
      setSearchProgress({ current: 0, total: allImages.length, status: `Found ${allImages.length} photos to search.` });

      const foundMatches = new Set();
      
      const batchSize = 5;
      for (let i = 0; i < allImages.length; i += batchSize) {
        const batch = allImages.slice(i, i + batchSize);
        await Promise.all(batch.map(async (imageData, index) => {
          const currentIndex = i + index + 1;
          setSearchProgress({ current: currentIndex, total: allImages.length, status: `Searching image ${currentIndex} of ${allImages.length}...` });
          try {
            const searchImg = await faceapi.fetchImage(imageData.url);
            // **FIX**: Changed to withFaceDescriptors (plural) for detecting multiple faces
            const searchDetections = await faceapi.detectAllFaces(searchImg, detectorOptions).withFaceLandmarks().withFaceDescriptors();
            
            searchDetections.forEach(detection => {
              const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
              if (bestMatch.label !== 'unknown') { 
                foundMatches.add(imageData.url);
              }
            });
          } catch (imgError) {
            console.warn(`Could not process image ${imageData.url}.`, imgError);
          }
        }));
      }
      
      const uniqueResults = Array.from(foundMatches).map(url => allImages.find(img => img.url === url)).filter(Boolean);
      setResults(uniqueResults);

    } catch (e) {
      console.error("An error occurred during the search process:", e);
      setError("An unexpected error occurred during the search. Please try again.");
    } finally {
      setIsSearching(false);
      setSearchProgress({ current: allImages.length, total: allImages.length, status: 'Search complete!' });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20">
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-center py-20 relative overflow-hidden">
          <div className="absolute inset-0  opacity-30"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">Find Your Photo</h1>
            <p className="text-xl mb-6">Upload your photo to find pictures of yourself from our events and gallery!</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            
            {!modelsLoaded && (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <LoadingSpinner text="Preparing face recognition models..." />
                <p className="text-sm text-gray-500 mt-4">This may take a moment on the first visit.</p>
              </div>
            )}
            
            {modelsLoaded && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Upload Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">1. Upload Your Image</h2>
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/png, image/jpeg"
                      className="hidden"
                    />
                    {userImagePreview ? (
                      <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg">
                        <Image src={userImagePreview} alt="Your uploaded photo" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <p className="font-semibold text-gray-700">Click to upload a photo</p>
                        <p className="text-xs text-gray-500">PNG or JPG, max 5MB</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!userImage || isSearching}
                    className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg disabled:bg-gray-400 hover:bg-teal-700 transition-colors shadow-lg disabled:cursor-not-allowed"
                  >
                    {isSearching ? <LoadingSpinner text="Searching..." color="white" /> : "2. Find My Photos"}
                  </button>
                </div>
                
                {/* Instructions & Privacy */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">How it Works & Privacy</h3>
                  <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside">
                    <li>We use an accurate detector to find the face in your uploaded photo.</li>
                    <li>Your photo is <strong className="text-teal-700">not stored</strong> on our servers.</li>
                    <li>We compare your face against photos in our public event and gallery albums.</li>
                    <li>The process may take a minute depending on the number of photos.</li>
                    <li>For this feature to work, a one-time CORS configuration is needed on Firebase.</li>
                  </ul>
                </div>
              </div>
            )}
            {error && <div className="mt-6 text-center text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}
          </div>

          {/* Results Section with Progress */}
          {searchAttempted && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">Search Results</h2>
              {isSearching ? (
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                  <LoadingSpinner size="xl" text={searchProgress.status}/>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${searchProgress.total > 0 ? (searchProgress.current / searchProgress.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {results.map((result, index) => (
                    <Link href={result.link} key={index} className="group block">
                      <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform">
                        <Image src={result.url} alt={`Match found ${index + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 font-bold">View Source</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-2xl font-bold text-gray-800">No Matches Found</p>
                    <p className="text-gray-500 mt-2">We couldn't find any photos with a matching face.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchYourImagePage;

