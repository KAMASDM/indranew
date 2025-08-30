'use client';
import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import LoadingSpinner from '../LoadingSpinner';
import Image from 'next/image';

export default function HeroAboutAdmin() {
  const [heroImages, setHeroImages] = useState([]);
  const [aboutContent, setAboutContent] = useState({
    title: '',
    description: '',
    mission: '',
    vision: '',
    values: []
  });
  const [loading, setLoading] = useState({ hero: false, about: false, delete: false });
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchHeroImages();
    fetchAboutContent();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const q = query(collection(db, 'heroImages'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const images = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHeroImages(images);
    } catch (error) {
      console.error('Error fetching hero images:', error);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const docRef = doc(db, 'content', 'about');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAboutContent({
          title: data.title || '',
          description: data.description || '',
          mission: data.mission || '',
          vision: data.vision || '',
          values: Array.isArray(data.values) ? data.values : []
        });
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    }
  };

  const handleHeroFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroFile(file);
      setHeroPreview(URL.createObjectURL(file));
    }
  };

  const handleHeroUpload = async (e) => {
    e.preventDefault();
    if (!heroFile) return;
    
    setLoading(prev => ({ ...prev, hero: true }));
    try {
      const storageRef = ref(storage, `hero-images/${Date.now()}_${heroFile.name}`);
      const snapshot = await uploadBytes(storageRef, heroFile);
      const url = await getDownloadURL(snapshot.ref);
      
      await addDoc(collection(db, 'heroImages'), {
        url,
        fileName: heroFile.name,
        uploadedAt: new Date().toISOString()
      });
      
      setHeroFile(null);
      setHeroPreview(null);
      fetchHeroImages();
    } catch (error) {
      setErrors(prev => ({ ...prev, hero: 'Failed to upload hero image' }));
      console.error('Error uploading hero image:', error);
    } finally {
      setLoading(prev => ({ ...prev, hero: false }));
    }
  };

  const handleDeleteHeroImage = async (id, url) => {
    if (!window.confirm('Delete this hero image?')) return;
    
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await deleteDoc(doc(db, 'heroImages', id));
      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      } catch (err) {
        console.warn('Could not delete image from storage:', err);
      }
      fetchHeroImages();
    } catch (error) {
      alert('Failed to delete hero image');
      console.error('Error deleting hero image:', error);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, about: true }));
    
    try {
      const docRef = doc(db, 'content', 'about');
      await setDoc(docRef, {
        ...aboutContent,
        updatedAt: new Date().toISOString()
      });
      alert('About content updated successfully');
    } catch (error) {
      setErrors(prev => ({ ...prev, about: 'Failed to update about content' }));
      console.error('Error updating about content:', error);
    } finally {
      setLoading(prev => ({ ...prev, about: false }));
    }
  };

  const handleAboutChange = (field, value) => {
    setAboutContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addValue = () => {
    setAboutContent(prev => ({
      ...prev,
      values: [...prev.values, '']
    }));
  };

  const updateValue = (index, value) => {
    setAboutContent(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === index ? value : v)
    }));
  };

  const removeValue = (index) => {
    setAboutContent(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      {/* Hero Images Management */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Hero Images Management</h2>
          <p className="text-indigo-100 mt-2">Upload and manage hero section background images</p>
        </div>
        
        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Hero Image</h3>
              <form onSubmit={handleHeroUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hero Image
                  </label>
                  <input
                    type="file"
                    onChange={handleHeroFileChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-none hover:border-indigo-300 transition-colors"
                    accept="image/*"
                    required
                  />
                  {errors.hero && (
                    <p className="text-red-500 text-sm mt-1">{errors.hero}</p>
                  )}
                  {heroPreview && (
                    <div className="mt-4">
                      <Image
                        src={heroPreview}
                        alt="Preview"
                        width={300}
                        height={200}
                        className="rounded-xl object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading.hero || !heroFile}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.hero ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Uploading...</span>
                    </span>
                  ) : (
                    'Upload Hero Image'
                  )}
                </button>
              </form>
            </div>

            {/* Current Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Hero Images ({heroImages.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {heroImages.map((image, index) => (
                  <div key={image.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={image.url}
                          alt={`Hero image ${index + 1}`}
                          width={80}
                          height={60}
                          className="rounded-lg object-cover border border-gray-200"
                        />
                        {index === 0 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{image.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHeroImage(image.id, image.url)}
                      disabled={loading.delete}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {loading.delete ? <LoadingSpinner size="sm" color="gray" /> : 'Delete'}
                    </button>
                  </div>
                ))}
                {heroImages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-2xl">🖼️</span>
                    </div>
                    <p className="text-gray-500">No hero images uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Content Management */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">About Us Content</h2>
          <p className="text-teal-100 mt-2">Manage your organization&apos;s about page content</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleAboutSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Title
                </label>
                <input
                  type="text"
                  value={aboutContent.title}
                  onChange={(e) => handleAboutChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none transition-colors"
                  placeholder="Enter about page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Statement
                </label>
                <textarea
                  value={aboutContent.mission}
                  onChange={(e) => handleAboutChange('mission', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none transition-colors resize-none"
                  placeholder="Enter your mission statement"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Description
              </label>
              <textarea
                value={aboutContent.description}
                onChange={(e) => handleAboutChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none transition-colors resize-none"
                placeholder="Enter detailed description about your organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision Statement
              </label>
              <textarea
                value={aboutContent.vision}
                onChange={(e) => handleAboutChange('vision', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none transition-colors resize-none"
                placeholder="Enter your vision statement"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Core Values
                </label>
                <button
                  type="button"
                  onClick={addValue}
                  className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  Add Value
                </button>
              </div>
              <div className="space-y-3">
                {(aboutContent.values && aboutContent.values.length > 0) ? (
                  <>
                    {aboutContent.values.map((value, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateValue(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none transition-colors"
                          placeholder={`Core value ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeValue(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No values added yet. Click &quot;Add Value&quot; to start.</p>
                )}
              </div>
            </div>

            {errors.about && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                {errors.about}
              </div>
            )}

            <button
              type="submit"
              disabled={loading.about}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.about ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Updating...</span>
                </span>
              ) : (
                'Update About Content'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}