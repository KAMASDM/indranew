'use client';

import { useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Admin = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const [heroImage, setHeroImage] = useState(null);
  const [galleryImage, setGalleryImage] = useState(null);
  const [galleryCaption, setGalleryCaption] = useState('');

  const [loading, setLoading] = useState({ event: false, hero: false, gallery: false });

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, event: true }));
    try {
      await addDoc(collection(db, 'events'), {
        name: eventName,
        date: eventDate,
        description: eventDescription,
      });
      alert('Event added successfully!');
      setEventName('');
      setEventDate('');
      setEventDescription('');
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Failed to add event.');
    } finally {
      setLoading(prev => ({ ...prev, event: false }));
    }
  };

  const handleImageUpload = async (image, path, collectionName, caption = null) => {
    if (!image) return null;
    const storageRef = ref(storage, `${path}/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);
    
    const docData = {
      url: downloadURL,
      uploadedAt: serverTimestamp()
    };
    if (caption) {
        docData.caption = caption;
    }

    await addDoc(collection(db, collectionName), docData);
    return downloadURL;
  };

  const handleHeroImageUpload = async (e) => {
    e.preventDefault();
    setLoading(prev => ({...prev, hero: true}));
    try {
        await handleImageUpload(heroImage, 'hero-images', 'heroImages');
        alert('Hero image uploaded successfully!');
        setHeroImage(null);
    } catch(error) {
        console.error('Error uploading hero image:', error);
        alert('Failed to upload hero image.');
    } finally {
        setLoading(prev => ({...prev, hero: false}));
    }
  };

  const handleGalleryImageUpload = async (e) => {
    e.preventDefault();
    setLoading(prev => ({...prev, gallery: true}));
    try {
        await handleImageUpload(galleryImage, 'gallery-images', 'gallery', galleryCaption);
        alert('Gallery image uploaded successfully!');
        setGalleryImage(null);
        setGalleryCaption('');
    } catch(error) {
        console.error('Error uploading gallery image:', error);
        alert('Failed to upload gallery image.');
    } finally {
        setLoading(prev => ({...prev, gallery: false}));
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 border-b pb-4">Admin Panel</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent}>
          <div className="mb-4">
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name</label>
            <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Event Date</label>
            <input type="date" id="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div className="mb-4">
            <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <button type="submit" disabled={loading.event} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400">{loading.event ? 'Adding...' : 'Add Event'}</button>
        </form>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upload New Hero Image</h2>
        <form onSubmit={handleHeroImageUpload}>
          <div className="mb-4">
            <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">Select Image (latest one will be displayed)</label>
            <input type="file" id="heroImage" onChange={(e) => setHeroImage(e.target.files[0])} className="mt-1 block w-full" required />
          </div>
          <button type="submit" disabled={loading.hero} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400">{loading.hero ? 'Uploading...' : 'Upload Hero Image'}</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Upload to Gallery</h2>
        <form onSubmit={handleGalleryImageUpload}>
          <div className="mb-4">
            <label htmlFor="galleryImage" className="block text-sm font-medium text-gray-700">Select Image</label>
            <input type="file" id="galleryImage" onChange={(e) => setGalleryImage(e.target.files[0])} className="mt-1 block w-full" required />
          </div>
          <div className="mb-4">
            <label htmlFor="galleryCaption" className="block text-sm font-medium text-gray-700">Caption (Optional)</label>
            <input type="text" id="galleryCaption" value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <button type="submit" disabled={loading.gallery} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400">{loading.gallery ? 'Uploading...' : 'Upload to Gallery'}</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;