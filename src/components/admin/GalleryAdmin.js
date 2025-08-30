'use client';
import { useState } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import LoadingSpinner from '../LoadingSpinner';
import Image from 'next/image';

function FormField({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 hover:border-purple-300 text-gray-900 placeholder-gray-400 border-gray-200 bg-white"
        placeholder="Enter image caption..."
      />
    </div>
  );
}

function SubmitButton({ loading, text, className = '' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`relative w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-3">Uploading...</span>
        </div>
      ) : (
        <span className="flex items-center justify-center">
          <span className="mr-2">Upload</span>
          {text}
        </span>
      )}
    </button>
  );
}

export default function GalleryAdmin({ galleryImages, fetchAllData }) {
  const [files, setFiles] = useState([]);
  const [showPreview, setShowPreview] = useState([]);
  const [galleryCaption, setGalleryCaption] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({ gallery: false, delete: false });
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const fileList = e.target.files;
    processFiles(fileList);
  };

  const processFiles = (fileList) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const selectedFiles = Array.from(fileList).filter(file =>
      validTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
    );
    setFiles(selectedFiles);
    setShowPreview(selectedFiles.map(file => URL.createObjectURL(file)));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleGalleryImageUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(prev => ({ ...prev, gallery: true }));
    try {
      await Promise.all(files.map(async (file) => {
        const storageRef = ref(storage, `gallery-images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, 'gallery'), {
          url,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          caption: galleryCaption.trim() || '',
        });
      }));
      setFiles([]);
      setShowPreview([]);
      setGalleryCaption('');
      if (fetchAllData) fetchAllData();
    } catch (error) {
      setErrors(prev => ({ ...prev, gallery: 'Failed to upload gallery images. Please try again.' }));
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, gallery: false }));
    }
  };

  const handleDelete = (id, url) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    setLoading(prev => ({ ...prev, delete: true }));
    deleteDoc(doc(db, 'gallery', id))
      .then(async () => {
        try {
          const imageRef = ref(storage, url);
          await deleteObject(imageRef);
        } catch (err) {
          console.warn('Could not delete image from storage:', err);
        }
        if (fetchAllData) fetchAllData();
      })
      .catch(err => {
        alert('Failed to delete image.');
        console.error(err);
      })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            Upload to Gallery
          </h2>
          <p className="text-purple-100 mt-2">Add images to your photo gallery</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleGalleryImageUpload} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-800">
                Select Images (multiple files supported)
              </label>
              
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="galleryImages"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  multiple
                  required
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl">+</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Drop images here or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Supports JPEG, PNG, WebP up to 5MB each</p>
                  </div>
                </div>
              </div>
              
              {errors.gallery && (
                <p className="text-red-500 text-sm flex items-center">
                  <span className="mr-1">Alert:</span>{errors.gallery}
                </p>
              )}
              
              {/* Preview Grid */}
              {showPreview.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">Preview ({showPreview.length} images)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {showPreview.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={src}
                          alt={`Preview ${idx+1}`}
                          width={120}
                          height={120}
                          className="rounded-xl object-cover w-full h-24 border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <FormField
              label="Caption (Optional - applies to all images)"
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
            />
            
            <SubmitButton loading={loading.gallery} text="to Gallery" />
          </form>
        </div>
      </div>

      {/* Gallery Images Display */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                Gallery Images
              </h2>
              <p className="text-gray-600 mt-1">Manage your photo gallery ({galleryImages.length} images)</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-gray-200 px-3 py-2 rounded-lg font-medium">
                Total: {galleryImages.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {galleryImages.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryImages.map(image => (
                <div key={image.id} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-purple-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <Image
                      src={image.url}
                      alt={image.caption || 'Gallery image'}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                    <button
                      onClick={() => handleDelete(image.id, image.url)}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      disabled={loading.delete}
                      title="Delete image"
                    >
                      {loading.delete ? <LoadingSpinner size="sm" color="white" /> : '×'}
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {image.caption || 'Untitled'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString() : 'No date'}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {image.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-gray-400 text-3xl">Gallery</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No images in gallery</h3>
              <p className="text-gray-600">Upload your first images to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}