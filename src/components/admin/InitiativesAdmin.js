"use client";
import { useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingSpinner from '../LoadingSpinner';
import Image from 'next/image';

function EditInitiativeForm({ editingItem, setEditingItem, fetchAllData }) {
  const [title, setTitle] = useState(editingItem.title || '');
  const [description, setDescription] = useState(editingItem.description || '');
  const [slug, setSlug] = useState(editingItem.slug || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(editingItem.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let imageUrl = editingItem.imageUrl || '';
      if (imageFile) {
        const storageRef = ref(storage, `initiatives/${editingItem.id}/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      await updateDoc(doc(db, 'initiatives', editingItem.id), {
        title,
        description,
        slug,
        imageUrl
      });
      setEditingItem(null);
      if (fetchAllData) fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to update initiative');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none transition-colors"
          rows={6}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Slug</label>
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">Initiative Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 focus:border-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
        />
        {previewUrl && (
          <div className="mt-4">
            <Image
              src={previewUrl}
              alt="Preview"
              width={200}
              height={150}
              className="rounded-xl object-cover border-2 border-gray-200 shadow-md"
            />
          </div>
        )}
      </div>
      {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => setEditingItem(null)}
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors shadow-lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, name, type = 'text', value, onChange, required = false, placeholder = '', rows = 3, error }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="flex items-center text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 hover:border-blue-300 text-gray-900 placeholder-gray-400 resize-none ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 hover:border-blue-300 text-gray-900 placeholder-gray-400 ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          />
        )}
        {error && (
          <div className="absolute -bottom-6 left-0 flex items-center">
            <span className="text-red-500 text-xs font-bold">⚠</span>
            <span className="text-red-500 text-xs ml-1">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ loading, text, className = '' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`relative w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-3">Processing...</span>
        </div>
      ) : (
        <span className="flex items-center justify-center">
          <span className="mr-2">+</span>
          {text}
        </span>
      )}
    </button>
  );
}

export default function InitiativesAdmin({ initiatives, fetchAllData }) {
  const [formData, setFormData] = useState({
    initiativeTitle: '',
    initiativeSlug: '',
    initiativeDescription: '',
    initiativeImage: null,
  });
  const [showPreview, setShowPreview] = useState({ initiativeImage: null });
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({ initiative: false, delete: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'initiativeTitle') {
      const slug = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();
      setFormData(prev => ({ ...prev, initiativeSlug: slug }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, initiativeImage: file }));
      setShowPreview({ initiativeImage: URL.createObjectURL(file) });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.initiativeTitle.trim()) newErrors.initiativeTitle = 'Title is required';
    if (!formData.initiativeSlug.trim()) newErrors.initiativeSlug = 'Slug is required';
    if (!formData.initiativeDescription.trim()) newErrors.initiativeDescription = 'Description is required';
    if (!formData.initiativeImage) newErrors.initiativeImage = 'Image is required';
    return newErrors;
  };

  const handleAddInitiative = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(prev => ({ ...prev, initiative: true }));
    try {
      const docRef = await addDoc(collection(db, 'initiatives'), {
        title: formData.initiativeTitle,
        slug: formData.initiativeSlug,
        description: formData.initiativeDescription,
        createdAt: new Date().toISOString(),
        featured: false,
        imageUrl: '',
      });
      
      if (formData.initiativeImage) {
        const storageRef = ref(storage, `initiatives/${docRef.id}/${formData.initiativeImage.name}`);
        await uploadBytes(storageRef, formData.initiativeImage);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'initiatives', docRef.id), { imageUrl: url });
      }
      
      setFormData({ initiativeTitle: '', initiativeSlug: '', initiativeDescription: '', initiativeImage: null });
      setShowPreview({ initiativeImage: null });
      if (fetchAllData) fetchAllData();
    } catch (err) {
      setErrors(prev => ({ ...prev, initiative: 'Failed to add initiative. Please try again.' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, initiative: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Initiative Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-3 text-3xl">🎯</span>
            Add New Initiative
          </h2>
          <p className="text-blue-100 mt-2">Create impactful community initiatives</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleAddInitiative}>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  label="Initiative Title"
                  name="initiativeTitle"
                  value={formData.initiativeTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter initiative title"
                  error={errors.initiativeTitle}
                />
                <FormField
                  label="URL Slug"
                  name="initiativeSlug"
                  value={formData.initiativeSlug}
                  onChange={handleInputChange}
                  placeholder="auto-generated-from-title"
                  required
                  error={errors.initiativeSlug}
                />
                <div className="space-y-3">
                  <label className="flex items-center text-sm font-semibold text-gray-800">
                    Initiative Image <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="initiativeImage"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 focus:border-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
                      accept="image/*"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-400 text-sm">Click to upload image</span>
                    </div>
                  </div>
                  {errors.initiativeImage && (
                    <p className="text-red-500 text-xs flex items-center">
                      <span className="mr-1">⚠</span>{errors.initiativeImage}
                    </p>
                  )}
                  {showPreview.initiativeImage && (
                    <div className="mt-4">
                      <Image
                        src={showPreview.initiativeImage}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="rounded-xl object-cover border-2 border-gray-200 shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <FormField
                  label="Description"
                  name="initiativeDescription"
                  type="textarea"
                  value={formData.initiativeDescription}
                  onChange={handleInputChange}
                  rows={8}
                  required
                  placeholder="Describe your initiative in detail..."
                  error={errors.initiativeDescription}
                />
                <SubmitButton loading={loading.initiative} text="Create Initiative" />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Current Initiatives */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">📋</span>
                Current Initiatives
              </h2>
              <p className="text-gray-600 mt-1">Manage your community initiatives</p>
            </div>
            <button
              onClick={() => alert('Export CSV functionality can be implemented here')}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {initiatives.map(initiative => (
              <div key={initiative.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {initiative.title?.charAt(0) || 'I'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {initiative.title}
                          </h3>
                          {initiative.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                          /{initiative.slug}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(initiative)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const prev = initiatives.find(i => i.featured);
                          if (prev && prev.id !== initiative.id) {
                            await updateDoc(doc(db, 'initiatives', prev.id), { featured: false });
                          }
                          await updateDoc(doc(db, 'initiatives', initiative.id), { featured: true });
                          if (fetchAllData) fetchAllData();
                        }}
                        className={`p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors ${
                          initiative.featured ? 'bg-yellow-100' : ''
                        }`}
                        disabled={initiative.featured}
                        title={initiative.featured ? 'Currently Featured' : 'Set as Featured'}
                      >
                        {initiative.featured ? 'Featured' : 'Feature'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this initiative?')) {
                            setLoading(prev => ({ ...prev, delete: true }));
                            deleteDoc(doc(db, 'initiatives', initiative.id))
                              .then(() => { if (fetchAllData) fetchAllData(); })
                              .catch(err => { alert('Failed to delete initiative.'); console.error(err); })
                              .finally(() => setLoading(prev => ({ ...prev, delete: false })));
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading.delete}
                        title="Delete"
                      >
                        {loading.delete ? <LoadingSpinner size="sm" color="gray" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                  
                  {initiative.imageUrl ? (
                    <div className="relative">
                      <Image
                        src={initiative.imageUrl}
                        alt={initiative.title || 'Initiative image'}
                        width={400}
                        height={200}
                        className="rounded-xl object-cover w-full h-48 border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-200"></div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
                      <span className="text-gray-400 font-medium">No image uploaded</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {initiative.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {initiatives.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No initiatives yet</h3>
              <p className="text-gray-600">Create your first community initiative to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Initiative Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Edit Initiative</h3>
                <button 
                  onClick={() => setEditingItem(null)} 
                  className="text-white hover:text-blue-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8">
              <EditInitiativeForm editingItem={editingItem} setEditingItem={setEditingItem} fetchAllData={fetchAllData} />
            </div>
          </div>
        </div>

      )}
    </div>
  );
}