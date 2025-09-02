'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import * as faceapi from 'face-api.js';
import LoadingSpinner from '../components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';

// Enhanced model loading with multiple detection options
const loadModels = async () => {
  const MODEL_URL = '/models';
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // More accurate detector
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), // Optional: for additional filtering
    ]);
    console.log("All face models loaded successfully.");
    return true;
  } catch (error) {
    console.error("Error loading face models:", error);
    // Fallback to essential models only
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("Essential face models loaded successfully.");
      return true;
    } catch (fallbackError) {
      console.error("Error loading essential models:", fallbackError);
      return false;
    }
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
  const [searchProgress, setSearchProgress] = useState({ 
    current: 0, 
    total: 0, 
    status: '',
    currentImageUrl: '',
    startTime: null,
    facesDetected: 0,
    matchesFound: 0
  });
  const [sensitivity, setSensitivity] = useState(0.45); // More restrictive threshold
  const [useAdvancedDetector, setUseAdvancedDetector] = useState(false);
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
                urls.add({ url: data.url, link: '/gallery', source: 'gallery' });
            }
            if (coll === 'events' && data.images && Array.isArray(data.images)) {
                data.images.forEach(img => {
                    if (img.url) {
                        urls.add({ url: img.url, link: `/events/${doc.id}`, source: 'events' });
                    }
                });
            }
        });
    }
    
    return Array.from(urls);
  };

  // Enhanced image preprocessing
  const preprocessImage = (imgElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Optimize image size for better processing speed
    const maxSize = 800;
    let { width, height } = imgElement;
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Enhance contrast and brightness for better face detection
    ctx.filter = 'contrast(1.1) brightness(1.05)';
    ctx.drawImage(imgElement, 0, 0, width, height);
    
    return canvas;
  };

  // Get appropriate detector options based on settings
  const getDetectorOptions = () => {
    if (useAdvancedDetector) {
      return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
    }
    return new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 512, // Increased for better accuracy
      scoreThreshold: 0.3 // Lower threshold for initial detection
    });
  };

  // Calculate estimated time remaining
  const calculateETA = (current, total, startTime) => {
    if (current === 0) return null;
    const elapsed = Date.now() - startTime;
    const avgTimePerImage = elapsed / current;
    const remaining = (total - current) * avgTimePerImage;
    return Math.ceil(remaining / 1000); // Convert to seconds
  };

  // Enhanced face validation and matching
  const validateFaceQuality = (detection) => {
    // Check if face detection confidence is high enough
    if (detection.detection.score < 0.7) {
      return false;
    }
    
    // Check face size (avoid tiny faces that might be false positives)
    const { width, height } = detection.detection.box;
    if (width < 50 || height < 50) {
      return false;
    }
    
    // Check face landmarks quality
    const landmarks = detection.landmarks;
    if (!landmarks || !landmarks.positions || landmarks.positions.length < 68) {
      return false;
    }
    
    return true;
  };

  // Precise face matching with confidence scoring
  const isPreciseMatch = (faceMatcher, descriptor, detection) => {
    // First validate face quality
    if (!validateFaceQuality(detection)) {
      return { isMatch: false, confidence: 0 };
    }
    
    const match = faceMatcher.findBestMatch(descriptor);
    
    // Only consider it a match if:
    // 1. It's not labeled as 'unknown'
    // 2. The distance is significantly below our threshold
    // 3. The confidence is high
    if (match.label !== 'unknown') {
      const confidence = 1 - match.distance;
      const isHighConfidence = match.distance < sensitivity && confidence > 0.6;
      
      return { 
        isMatch: isHighConfidence, 
        confidence: confidence,
        distance: match.distance
      };
    }
    
    return { isMatch: false, confidence: 1 - match.distance };
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
    
    const startTime = Date.now();
    setSearchProgress({ 
      current: 0, 
      total: 0, 
      status: 'Initializing enhanced search...', 
      currentImageUrl: '',
      startTime,
      facesDetected: 0,
      matchesFound: 0
    });

    let allImages = [];
    let foundMatches = new Map(); // Store matches with confidence scores
    let facesDetected = 0;

    try {
      const detectorOptions = getDetectorOptions();
      
      // Enhanced user image validation
      setSearchProgress(prev => ({ ...prev, status: 'Analyzing your photo with enhanced detection...' }));
      
      // Preprocess user image
      const userImgElement = await faceapi.bufferToImage(userImage);
      const processedUserImg = preprocessImage(userImgElement);
      
      // Try multiple detection methods for user image with strict requirements
      let userDetections = await faceapi.detectSingleFace(processedUserImg, detectorOptions)
        .withFaceLandmarks().withFaceDescriptor();
      
      // Fallback to original image if preprocessing failed
      if (!userDetections) {
        userDetections = await faceapi.detectSingleFace(userImgElement, detectorOptions)
          .withFaceLandmarks().withFaceDescriptor();
      }

      if (!userDetections) {
        setError("Could not detect a face in your uploaded image. Try a clearer photo with better lighting and make sure your face takes up at least 1/4 of the image.");
        setIsSearching(false);
        return;
      }
      
      // Validate user face quality
      if (!validateFaceQuality(userDetections)) {
        setError("The face in your uploaded image is not clear enough for accurate matching. Please upload a high-quality, well-lit photo where your face is clearly visible.");
        setIsSearching(false);
        return;
      }
      
      // Create a more strict matcher for precise results
      const faceMatcher = new faceapi.FaceMatcher([userDetections.descriptor], sensitivity);
      
      setSearchProgress(prev => ({ 
        ...prev, 
        status: 'Fetching all event and gallery photos...' 
      }));
      
      allImages = await fetchAllImageUrls();
      if (allImages.length === 0) {
          setError("No images found in the gallery or events to search through.");
          setIsSearching(false);
          return;
      }
      
      setSearchProgress(prev => ({ 
        ...prev,
        total: allImages.length, 
        status: `Found ${allImages.length} photos. Starting enhanced search...` 
      }));

      const processedUrls = new Set(); // Prevent duplicate processing
      
      // Dynamic batch size based on device capability
      const batchSize = navigator.hardwareConcurrency > 4 ? 6 : 3; // Reduced for more careful processing
      
      for (let i = 0; i < allImages.length; i += batchSize) {
        const batch = allImages.slice(i, i + batchSize);
        
        // Process batch with improved error handling
        const batchPromises = batch.map(async (imageData, index) => {
          const currentIndex = i + index + 1;
          
          // Skip if already processed (in case of duplicates)
          if (processedUrls.has(imageData.url)) {
            return null;
          }
          processedUrls.add(imageData.url);
          
          const eta = calculateETA(currentIndex - 1, allImages.length, startTime);
          
          setSearchProgress(prev => ({ 
            ...prev,
            current: currentIndex, 
            status: `Analyzing image ${currentIndex} of ${allImages.length}${eta ? ` (${eta}s remaining)` : ''}`,
            currentImageUrl: imageData.url,
            facesDetected,
            matchesFound: foundMatches.size
          }));
          
          try {
            // Add timeout for slow-loading images
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Image load timeout')), 10000)
            );
            
            const imagePromise = faceapi.fetchImage(imageData.url);
            const searchImg = await Promise.race([imagePromise, timeoutPromise]);
            
            // Preprocess search image for better detection
            const processedSearchImg = preprocessImage(searchImg);
            
            // Use detectAllFaces for multiple face detection
            let searchDetections = await faceapi.detectAllFaces(processedSearchImg, detectorOptions)
              .withFaceLandmarks().withFaceDescriptors();
            
            // Fallback to original image if no faces found in processed version
            if (searchDetections.length === 0) {
              searchDetections = await faceapi.detectAllFaces(searchImg, detectorOptions)
                .withFaceLandmarks().withFaceDescriptors();
            }
            
            facesDetected += searchDetections.length;
            
            // Enhanced matching with strict validation
            let bestMatchForImage = null;
            let highestConfidence = 0;
            
            for (const detection of searchDetections) {
              const matchResult = isPreciseMatch(faceMatcher, detection.descriptor, detection);
              
              if (matchResult.isMatch && matchResult.confidence > highestConfidence) {
                bestMatchForImage = {
                  ...imageData,
                  confidence: matchResult.confidence,
                  distance: matchResult.distance
                };
                highestConfidence = matchResult.confidence;
              }
            }
            
            // Only add if we found a high-confidence match
            if (bestMatchForImage && highestConfidence > 0.65) {
              foundMatches.set(imageData.url, bestMatchForImage);
            }
            
            return currentIndex;
          } catch (imgError) {
            console.warn(`Could not process image ${imageData.url}:`, imgError.message);
            return currentIndex;
          }
        });
        
        // Wait for batch completion
        await Promise.allSettled(batchPromises);
        
        // Update progress after each batch
        setSearchProgress(prev => ({ 
          ...prev,
          facesDetected,
          matchesFound: foundMatches.size
        }));
      }
      
      // Sort results by confidence (highest first) and limit to most confident matches
      const sortedMatches = Array.from(foundMatches.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 20); // Limit to top 20 most confident matches
      
      setResults(sortedMatches);

    } catch (e) {
      console.error("An error occurred during the search process:", e);
      setError("An unexpected error occurred during the search. Please try again with different settings.");
    } finally {
      setIsSearching(false);
      const finalTime = Math.round((Date.now() - startTime) / 1000);
      setSearchProgress(prev => ({ 
        ...prev,
        current: allImages.length, 
        status: `Search complete in ${finalTime}s! Found ${foundMatches.size} high-confidence matches from ${facesDetected} faces analyzed.` 
      }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pt-20">
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-center py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">Enhanced Face Search</h1>
            <p className="text-xl mb-6">Advanced facial recognition with real-time progress tracking!</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            
            {!modelsLoaded && (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <LoadingSpinner text="Loading enhanced AI models..." />
                <p className="text-sm text-gray-500 mt-4">Loading multiple detection models for better accuracy.</p>
              </div>
            )}
            
            {modelsLoaded && (
              <div className="grid md:grid-cols-2 gap-8 items-start">
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
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-700">Click to upload a photo</p>
                        <p className="text-xs text-gray-500">PNG or JPG, max 5MB</p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sensitivity: {sensitivity.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0.35"
                        max="0.65"
                        step="0.05"
                        value={sensitivity}
                        onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={isSearching}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>More Selective</span>
                        <span>Less Selective</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="advanced-detector"
                        type="checkbox"
                        checked={useAdvancedDetector}
                        onChange={(e) => setUseAdvancedDetector(e.target.checked)}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        disabled={isSearching}
                      />
                      <label htmlFor="advanced-detector" className="ml-2 text-sm text-gray-700">
                        Use advanced detector (slower but more accurate)
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={!userImage || isSearching}
                    className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg disabled:bg-gray-400 hover:bg-teal-700 transition-colors shadow-lg disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner color="white" size="sm" />
                        <span>Searching...</span>
                      </div>
                    ) : (
                      "2. Start Enhanced Search"
                    )}
                  </button>
                </div>
                
                {/* Instructions & Privacy */}
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Precision-Focused Features</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>High-precision matching:</strong> Only shows 65%+ confidence matches to eliminate false positives</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Face quality validation:</strong> Filters out blurry or low-quality faces before matching</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Confidence scoring:</strong> Each result shows match confidence percentage</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>Smart result limiting:</strong> Shows top 20 most confident matches only</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">🔒</span>
                      <span><strong>Privacy protected:</strong> No images stored on servers</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Enhanced Results Section with Detailed Progress */}
          {searchAttempted && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">Search Results</h2>
              
              {isSearching ? (
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="text-center mb-6">
                    <LoadingSpinner size="xl" text={searchProgress.status}/>
                  </div>
                  
                  {/* Enhanced Progress Bar */}
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-cyan-600 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${searchProgress.total > 0 ? (searchProgress.current / searchProgress.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Detailed Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-bold text-blue-600">{searchProgress.current}</div>
                        <div className="text-blue-500">Images Processed</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-bold text-green-600">{searchProgress.facesDetected}</div>
                        <div className="text-green-500">Faces Found</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-bold text-purple-600">{searchProgress.matchesFound}</div>
                        <div className="text-purple-500">Matches Found</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="font-bold text-orange-600">
                          {searchProgress.total > 0 ? Math.round((searchProgress.current / searchProgress.total) * 100) : 0}%
                        </div>
                        <div className="text-orange-500">Complete</div>
                      </div>
                    </div>
                    
                    {/* Current Image Preview */}
                    {searchProgress.currentImageUrl && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Currently analyzing:</p>
                        <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden">
                          <Image 
                            src={searchProgress.currentImageUrl} 
                            alt="Currently processing" 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="text-center mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-lg font-semibold text-green-800">
                      Found {results.length} high-confidence photo{results.length !== 1 ? 's' : ''} with your face!
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Showing only matches with 65%+ confidence
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((result, index) => (
                      <Link href={result.link} key={index} className="group block">
                        <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform">
                          <Image src={result.url} alt={`Match found ${index + 1}`} fill className="object-cover" />
                          {/* Confidence badge */}
                          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(result.confidence * 100)}%
                          </div>
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-center">
                              <div className="font-bold">View Source</div>
                              <div className="text-sm capitalize">{result.source}</div>
                              <div className="text-xs mt-1">Confidence: {Math.round(result.confidence * 100)}%</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-md border">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">No Matches Found</p>
                  <p className="text-gray-500 mb-4">We analyzed {searchProgress.facesDetected} faces but couldn&apos;t find any matches.</p>
                  <p className="text-sm text-gray-400">Try adjusting the sensitivity or using a different photo.</p>
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