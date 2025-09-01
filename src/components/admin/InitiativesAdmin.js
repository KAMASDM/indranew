'use client';
import { useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import LoadingSpinner from '../LoadingSpinner';
import Image from 'next/image';

// Modal for Adding/Editing an Initiative
function InitiativeModal({ initiative, onClose, onSave }) {
  const initialData = {
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    category: '',
    impact: { number: '', metric: '', description: '' },
    featured: false,
    imageUrl: '',
    features: [],
    gallery: [],
  };
  
  const [formData, setFormData] = useState(initiative ? { ...initialData, ...initiative, impact: { ...initialData.impact, ...initiative.impact }, features: initiative.features || [], gallery: initiative.gallery || [] } : initialData);
  const [mainImageFiles, setMainImageFiles] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData };
    
    if (name.startsWith('impact.')) {
      const field = name.split('.')[1];
      newFormData.impact = { ...newFormData.impact, [field]: value };
    } else {
      newFormData[name] = type === 'checkbox' ? checked : value;
    }
    
    // Auto-generate slug from title for new initiatives
    if (name === 'title' && !formData.id) {
      newFormData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    
    setFormData(newFormData);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };
  
  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (index) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  
  const handleFileChange = (e, type) => {
    if (type === 'main') setMainImageFiles(Array.from(e.target.files));
    if (type === 'gallery') setGalleryFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let mainImageUrls = formData.imageUrl ? (Array.isArray(formData.imageUrl) ? [...formData.imageUrl] : [formData.imageUrl]) : [];
      const initiativeId = formData.id || Date.now(); // Use existing ID or generate a temporary one for storage path

      if (mainImageFiles && mainImageFiles.length > 0) {
        for (const file of mainImageFiles) {
          const storageRef = ref(storage, `initiatives/${initiativeId}/main_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          mainImageUrls.push(url);
        }
      }

      const galleryUrls = await Promise.all(
        galleryFiles.map(async (file) => {
          const storageRef = ref(storage, `initiatives/${initiativeId}/gallery_${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          return { url: await getDownloadURL(storageRef), caption: '' }; // Caption can be added later
        })
      );

      const initiativeData = {
        ...formData,
        imageUrl: mainImageUrls,
        gallery: [...(formData.gallery || []), ...galleryUrls],
        updatedAt: serverTimestamp(),
      };
      
      if (!initiativeData.createdAt) {
          initiativeData.createdAt = serverTimestamp();
      }
      
      await onSave(initiativeData);
      onClose();
    } catch (error) {
      console.error("Error saving initiative:", error);
      alert("Failed to save initiative. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto border-2 border-teal-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-teal-700">{initiative ? 'Edit Initiative' : 'Add New Initiative'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-teal-600 text-3xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <fieldset className="border-2 border-teal-100 p-4 rounded-xl bg-teal-50/30">
            <legend className="font-semibold px-2 text-lg text-teal-700">Basic Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              <input name="title" value={formData.title} onChange={handleChange} placeholder="Initiative Title" required className="w-full border-2 border-teal-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-gray-800"/>
              <input name="slug" value={formData.slug} onChange={handleChange} placeholder="URL Slug" required className="w-full border-2 border-teal-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-gray-800"/>
              <input name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g., food-security)" required className="w-full border-2 border-teal-200 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-gray-800"/>
              <div className="flex items-center gap-3 bg-teal-50 p-3 rounded-lg">
                <input type="checkbox" name="featured" id="featured" checked={formData.featured} onChange={handleChange} className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"/>
                <label htmlFor="featured" className="font-semibold text-teal-700">Mark as Featured</label>
              </div>
            </div>
          </fieldset>
          
          {/* Descriptions */}
          <fieldset className="border-2 border-blue-100 p-4 rounded-xl bg-blue-50/30">
            <legend className="font-semibold px-2 text-lg text-blue-700">Content</legend>
            <div className="p-2 space-y-4">
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description (for cards)" required className="w-full border-2 border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800" rows="3"></textarea>
              <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} placeholder="Long Description (supports basic HTML)" className="w-full border-2 border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800" rows="6"></textarea>
            </div>
          </fieldset>
          
          {/* Impact Section */}
          <fieldset className="border-2 border-purple-100 p-4 rounded-xl bg-purple-50/30">
            <legend className="font-semibold px-2 text-lg text-purple-700">Impact Metrics</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
              <input name="impact.number" value={formData.impact.number} onChange={handleChange} placeholder="Number (e.g., 200,000+)" className="border-2 border-purple-200 p-2 rounded focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"/>
              <input name="impact.metric" value={formData.impact.metric} onChange={handleChange} placeholder="Metric (e.g., Meals Served)" className="border-2 border-purple-200 p-2 rounded focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"/>
              <input name="impact.description" value={formData.impact.description} onChange={handleChange} placeholder="Brief Description" className="border-2 border-purple-200 p-2 rounded focus:ring-2 focus:ring-purple-500 bg-white text-gray-800"/>
            </div>
          </fieldset>

          {/* Features Section */}
          <fieldset className="border-2 border-green-100 p-4 rounded-xl bg-green-50/30">
            <legend className="font-semibold px-2 text-lg text-green-700">Key Features</legend>
            <div className="space-y-2 p-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} placeholder={`Feature #${index + 1}`} className="flex-1 border-2 border-green-200 p-2 rounded focus:ring-2 focus:ring-green-500 bg-white"/>
                  <button type="button" onClick={() => removeFeature(index)} className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600">&times;</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 ml-2 hover:bg-green-600">Add Feature</button>
          </fieldset>

          {/* Image Uploads */}
          <fieldset className="border-2 border-cyan-100 p-4 rounded-xl bg-cyan-50/30">
            <legend className="font-semibold px-2 text-lg text-cyan-700">Media</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              <div>
                <label className="block text-sm font-semibold mb-2">Main Image</label>
                <input type="file" onChange={(e) => handleFileChange(e, 'main')} className="w-full border-2 border-cyan-200 p-2 rounded bg-white text-gray-800" multiple />
                {/* Show previews for all selected main images */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {mainImageFiles && mainImageFiles.length > 0 && mainImageFiles.map((file, i) => (
                    <img key={i} src={URL.createObjectURL(file)} alt="Preview" width={80} height={60} className="rounded object-cover border" />
                  ))}
                  {Array.isArray(formData.imageUrl) && formData.imageUrl.map((url, i) => (
                    <Image key={i} src={url} alt="Current Main" width={80} height={60} className="rounded object-cover border" />
                  ))}
                  {typeof formData.imageUrl === 'string' && formData.imageUrl && (
                    <Image src={formData.imageUrl} alt="Current Main" width={80} height={60} className="rounded object-cover border" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Gallery Images (Add more)</label>
                <input type="file" multiple onChange={(e) => handleFileChange(e, 'gallery')} className="w-full border-2 border-cyan-200 p-2 rounded bg-white text-gray-800"/>
                {formData.gallery && formData.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.gallery.map((img, i) => <Image key={i} src={img.url} alt="Gallery" width={60} height={60} className="rounded object-cover"/>)}
                  </div>
                )}
              </div>
            </div>
          </fieldset>
          
          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-black font-extrabold px-8 py-4 rounded-2xl border-2 border-white shadow-xl hover:from-yellow-400 hover:to-pink-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <LoadingSpinner size="sm" color="black"/> : 'Save Initiative'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function InitiativesAdmin({ initiatives, fetchAllData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleSaveInitiative = async (initiativeData) => {
    if (initiativeData.id) {
      const { id, ...data } = initiativeData;
      await updateDoc(doc(db, 'initiatives', id), data);
    } else {
      await addDoc(collection(db, 'initiatives'), initiativeData);
    }
    fetchAllData();
  };

  const handleDeleteInitiative = async (initiative) => {
    if (!window.confirm(`Are you sure you want to delete "${initiative.title}"? This action cannot be undone.`)) return;
    setLoadingDelete(true);
    try {
      if(initiative.imageUrl) await deleteObject(ref(storage, initiative.imageUrl)).catch(e => console.error("Could not delete main image: ", e));
      if(initiative.gallery && initiative.gallery.length > 0) {
        await Promise.all(initiative.gallery.map(img => deleteObject(ref(storage, img.url)).catch(e => console.error("Could not delete gallery image: ", e))));
      }
      await deleteDoc(doc(db, 'initiatives', initiative.id));
      fetchAllData();
    } catch (error) {
        console.error("Error deleting initiative:", error);
        alert("Failed to delete initiative. Some files may not have been removed from storage.");
    } finally {
        setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-8">
      {isModalOpen && <InitiativeModal initiative={editingInitiative} onClose={() => setIsModalOpen(false)} onSave={handleSaveInitiative} />}
      
      {/* Add Initiative Form */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center">
                <span className="mr-3 text-3xl">🎯</span>
                Add New Initiative
              </h2>
              <p className="text-indigo-600 mt-1">Create and manage your community initiatives from here.</p>
            </div>
            <button 
              onClick={() => { setEditingInitiative(null); setIsModalOpen(true); }} 
              className="bg-white text-teal-600 px-5 py-3 mt-4 md:mt-0 rounded-lg font-bold whitespace-nowrap hover:bg-cyan-50 transition-colors shadow-lg border-2 border-teal-100"
            >
              + Add New Initiative
            </button>
          </div>
        </div>
      </div>

      {/* Current Initiatives */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 border-b-2 border-teal-100">
          <h2 className="text-2xl font-extrabold text-teal-700">Current Initiatives ({initiatives.length})</h2>
        </div>
        <div className="p-6">
          {initiatives.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {initiatives.map(initiative => (
                <div key={initiative.id} className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 border-2 border-teal-100 rounded-2xl p-6 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg">
                            {initiative.title?.charAt(0) || 'I'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-extrabold text-lg text-teal-700 group-hover:text-cyan-700 transition-colors">
                              {initiative.title}
                            </h3>
                            <p className="text-xs text-cyan-700 font-mono bg-cyan-50 px-2 py-1 rounded border border-cyan-200 mt-1">
                              /{initiative.slug}
                            </p>
                          </div>
                        </div>
                        {initiative.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200 shadow">
                            FEATURED
                          </span>
                        )}
                      </div>
                      
                      {initiative.imageUrl ? (
                        <div className="relative mb-4">
                          <Image
                            src={initiative.imageUrl}
                            alt={initiative.title || 'Initiative image'}
                            width={400}
                            height={200}
                            className="rounded-xl object-cover w-full h-48 border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center rounded-xl border-2 border-dashed mb-4">
                          <span className="text-cyan-300 font-medium">No Image</span>
                        </div>
                      )}
                      
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {initiative.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t-2 border-teal-100 flex justify-end items-center gap-2">
                      <button
                        onClick={() => { setEditingInitiative(initiative); setIsModalOpen(true); }}
                        className="px-4 py-2 text-sm font-bold text-indigo-600 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-colors shadow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInitiative(initiative)}
                        className="px-4 py-2 text-sm font-bold text-indigo-600 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg transition-colors shadow"
                        disabled={loadingDelete}
                      >
                        {loadingDelete ? <LoadingSpinner size="sm" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No initiatives yet</h3>
              <p className="text-gray-600">Create your first community initiative to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

