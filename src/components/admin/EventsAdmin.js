'use client';
import { useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import LoadingSpinner from '../LoadingSpinner';
import Image from 'next/image';

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
            className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 hover:border-orange-300 text-gray-900 placeholder-gray-400 resize-none ${
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
            className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 hover:border-orange-300 text-gray-900 placeholder-gray-400 ${
              error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          />
        )}
        {error && (
          <div className="absolute -bottom-6 left-0 flex items-center">
            <span className="text-red-500 text-xs">⚠</span>
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
      className={`relative w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-3">Processing...</span>
        </div>
      ) : (
        <span className="flex items-center justify-center">
          <span className="mr-2">✨</span>
          {text}
        </span>
      )}
    </button>
  );
}

function EventListItem({ eventData, onDelete, loadingDelete, onImagesAdded }) {
  const [showAddImages, setShowAddImages] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreview(files.map(file => URL.createObjectURL(file)));
    setError('');
  };

  const handleUpload = async () => {
    if (!newImages.length) {
      setError('Please select images to upload.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded = await Promise.all(newImages.map(async (file) => {
        const storageRef = ref(storage, `events/${eventData.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { url, name: file.name, uploadedAt: new Date().toISOString() };
      }));
      
      const eventDoc = doc(db, 'events', eventData.id);
      const prevImages = Array.isArray(eventData.images) ? eventData.images : [];
      await updateDoc(eventDoc, { images: [...prevImages, ...uploaded] });
      setNewImages([]);
      setPreview([]);
      setShowAddImages(false);
      if (onImagesAdded) onImagesAdded();
    } catch (err) {
      setError('Failed to upload images.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (img) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      try {
        const imageRef = ref(storage, img.url);
        await deleteObject(imageRef);
      } catch (err) {
        console.warn('Could not delete image from storage:', err);
      }
      
      const eventDoc = doc(db, 'events', eventData.id);
      const prevImages = Array.isArray(eventData.images) ? eventData.images : [];
      const updatedImages = prevImages.filter(i => i.url !== img.url);
      await updateDoc(eventDoc, { images: updatedImages });
      if (onImagesAdded) onImagesAdded();
    } catch (err) {
      alert('Failed to delete image.');
      console.error(err);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                {eventData.name?.charAt(0) || 'E'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{eventData.name}</h3>
                <p className="text-sm text-gray-500 font-medium">
                  📅 {eventData.startDate ? new Date(eventData.startDate).toLocaleDateString() : (eventData.date ? new Date(eventData.date).toLocaleDateString() : 'No date')}
                </p>
              </div>
            </div>
            {eventData.description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{eventData.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowAddImages(v => !v)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
            >
              {showAddImages ? '✕ Cancel' : '📷 Add Images'}
            </button>
            <button
              onClick={onDelete}
              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              disabled={loadingDelete}
            >
              {loadingDelete ? <LoadingSpinner size="sm" color="gray" /> : '🗑️'}
            </button>
          </div>
        </div>

        {/* Existing Images */}
        {Array.isArray(eventData.images) && eventData.images.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
              🖼️ Event Images ({eventData.images.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {eventData.images.map((img, idx) => (
                <div key={img.url || idx} className="relative group/img">
                  <Image 
                    src={img.url} 
                    alt={img.name || `Event image ${idx+1}`} 
                    width={120} 
                    height={80} 
                    className="rounded-xl object-cover w-full h-20 border-2 border-gray-200" 
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Delete image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Images Section */}
        {showAddImages && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
              📤 Upload New Images
            </h4>
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl text-sm focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors"
              />
              {preview.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {preview.map((src, idx) => (
                    <Image 
                      key={idx} 
                      src={src} 
                      alt={`Preview ${idx+1}`} 
                      width={80} 
                      height={60} 
                      className="rounded-lg object-cover w-full h-16 border border-blue-200" 
                    />
                  ))}
                </div>
              )}
              {error && <p className="text-red-500 text-sm flex items-center"><span className="mr-1">⚠</span>{error}</p>}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Uploading...</span>
                  </span>
                ) : (
                  '🚀 Upload Images'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventsAdmin({ events, fetchAllData }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventStartDate: '',
    eventEndDate: '',
    eventDate: '',
    eventDescription: '',
    eventMapUrl: '',
  });
  const [files, setFiles] = useState({ eventImages: [] });
  const [showPreview, setShowPreview] = useState({ eventImages: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({ event: false, delete: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const selectedFiles = Array.from(fileList).filter(file =>
      validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
    );
    setFiles(prev => ({ ...prev, [name]: selectedFiles }));
    setShowPreview(prev => ({ ...prev, [name]: selectedFiles.map(file => URL.createObjectURL(file)) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.eventStartDate) newErrors.eventStartDate = 'Start date is required';
    if (!formData.eventEndDate) newErrors.eventEndDate = 'End date is required';
    if (!formData.eventDescription.trim()) newErrors.eventDescription = 'Event description is required';
    if (!formData.eventMapUrl.trim()) newErrors.eventMapUrl = 'Google Map URL is required';
    if (!files.eventImages || files.eventImages.length === 0) newErrors.eventImages = 'At least one event image is required';
    return newErrors;
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(prev => ({ ...prev, event: true }));
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        name: formData.eventName,
        startDate: formData.eventStartDate,
        endDate: formData.eventEndDate,
        description: formData.eventDescription,
        mapUrl: formData.eventMapUrl,
        createdAt: new Date().toISOString(),
        images: [],
      });
      
      const uploaded = await Promise.all(files.eventImages.map(async (file) => {
        const storageRef = ref(storage, `events/${docRef.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { url, name: file.name, uploadedAt: new Date().toISOString() };
      }));
      await updateDoc(doc(db, 'events', docRef.id), { images: uploaded });
      
      setFormData({ eventName: '', eventStartDate: '', eventEndDate: '', eventDate: '', eventDescription: '', eventMapUrl: '' });
      setFiles({ eventImages: [] });
      setShowPreview({ eventImages: [] });
      if (fetchAllData) fetchAllData();
    } catch (err) {
      setErrors(prev => ({ ...prev, event: 'Failed to add event. Please try again.' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, event: false }));
    }
  };

  return (
    <div className="grid xl:grid-cols-3 gap-8">
      {/* Add Event Form */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">📅</span>
              Add New Event
            </h2>
            <p className="text-orange-100 mt-2">Create engaging community events</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleAddEvent} className="space-y-6">
              <FormField
                label="Event Name"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                required
                placeholder="Enter event title"
                error={errors.eventName}
              />
              
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  label="Start Date"
                  name="eventStartDate"
                  type="date"
                  value={formData.eventStartDate}
                  onChange={handleInputChange}
                  required
                  error={errors.eventStartDate}
                />
                <FormField
                  label="End Date"
                  name="eventEndDate"
                  type="date"
                  value={formData.eventEndDate}
                  onChange={handleInputChange}
                  required
                  error={errors.eventEndDate}
                />
              </div>
              
              <FormField
                label="Description"
                name="eventDescription"
                type="textarea"
                value={formData.eventDescription}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Describe your event in detail..."
                error={errors.eventDescription}
              />
              
              <FormField
                label="Google Map URL"
                name="eventMapUrl"
                value={formData.eventMapUrl}
                onChange={handleInputChange}
                required
                placeholder="https://maps.google.com/..."
                error={errors.eventMapUrl}
              />
              
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-gray-800">
                  Event Images <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="eventImages"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 focus:border-orange-400 focus:outline-none hover:border-orange-300 transition-colors"
                    accept="image/*"
                    multiple
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400 text-sm">📤 Drop images here or click to browse</span>
                  </div>
                </div>
                {errors.eventImages && (
                  <p className="text-red-500 text-xs flex items-center">
                    <span className="mr-1">⚠</span>{errors.eventImages}
                  </p>
                )}
                {showPreview.eventImages && showPreview.eventImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {showPreview.eventImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <Image
                          src={src}
                          alt={`Preview ${idx+1}`}
                          width={100}
                          height={80}
                          className="rounded-xl object-cover w-full h-20 border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-xl transition-all duration-200"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <SubmitButton loading={loading.event} text="Create Event" />
            </form>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">📋</span>
                  Recent Events
                </h2>
                <p className="text-gray-600 mt-1">Manage your community events</p>
              </div>
              <button
                onClick={() => alert('Export CSV functionality can be implemented here')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6 max-h-[800px] overflow-y-auto">
              {events.map(eventData => (
                <EventListItem
                  key={eventData.id}
                  eventData={eventData}
                  onDelete={() => {
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      setLoading(prev => ({ ...prev, delete: true }));
                      deleteDoc(doc(db, 'events', eventData.id))
                        .then(() => {
                          if (fetchAllData) fetchAllData();
                        })
                        .catch(err => {
                          alert('Failed to delete event.');
                          console.error(err);
                        })
                        .finally(() => setLoading(prev => ({ ...prev, delete: false })));
                    }
                  }}
                  loadingDelete={loading.delete}
                  onImagesAdded={fetchAllData}
                />
              ))}
              {events.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No events yet</h3>
                  <p className="text-gray-600">Create your first community event to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}