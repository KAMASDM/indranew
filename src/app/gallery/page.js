'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const imageData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setImages(imageData);
      } catch (error) {
        console.error("Error fetching images: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <header className="bg-orange-500 text-white text-center py-20">
          <h1 className="text-5xl font-bold">Gallery</h1>
          <p className="text-xl mt-4">A Glimpse Into Our World</p>
        </header>

        <main className="container mx-auto px-6 py-16">
          {loading ? (
            <div className="text-center text-gray-500">Loading gallery...</div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="mb-4 break-inside-avoid cursor-pointer" onClick={() => setSelectedImg(img.url)}>
                  <Image src={img.url} alt={img.caption || 'Gallery image'} width={500} height={500} className="w-full h-auto rounded-lg shadow-md hover:opacity-80 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </main>

        {selectedImg && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImg(null)}>
            <div className="relative p-4">
              <Image src={selectedImg} alt="Enlarged view" width={800} height={600} className="max-w-full max-h-[90vh] rounded-lg" />
              <button className="absolute top-0 right-0 m-4 text-white text-3xl">&times;</button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default GalleryPage;
