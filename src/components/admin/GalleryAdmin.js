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
      <label className="block text-sm font-semibold text-blue-800">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 hover:border-blue-300 text-gray-800 placeholder-gray-400 border-blue-200 bg-white"
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
      className={`relative w-full bg-gradient-to-br from-pink-500 via-indigo-500 to-blue-500 text-black font-extrabold text-lg py-5 px-10 rounded-3xl border-4 border-white shadow-2xl hover:from-pink-600 hover:to-blue-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-3">Uploading...</span>
        </div>
      ) : (
        <>
          <span className="text-2xl">🚀</span>
          <span>{text}</span>
        </>
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState({ open: false, image: null, caption: '' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const pageSize = 8;
  const filteredImages = galleryImages.filter(img => {
    const matchesSearch = img.caption?.toLowerCase().includes(search.toLowerCase()) || img.fileName?.toLowerCase().includes(search.toLowerCase());
    const imgDate = img.uploadedAt ? new Date(img.uploadedAt) : null;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    let matchesDate = true;
    if (imgDate && fromDate && imgDate < fromDate) matchesDate = false;
    if (imgDate && toDate && imgDate > toDate) matchesDate = false;
    return matchesSearch && matchesDate;
  });
  const totalPages = Math.max(1, Math.ceil(filteredImages.length / pageSize));
  const paginatedImages = filteredImages.slice((page - 1) * pageSize, page * pageSize);

  const handleEditCaption = async () => {
    if (!editModal.image) return;
    setEditModal(modal => ({ ...modal, saving: true }));
    try {
      await fetch(`/api/gallery/${editModal.image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editModal.caption })
      });
      setEditModal({ open: false, image: null, caption: '', saving: false });
      if (fetchAllData) fetchAllData();
    } catch (err) {
      setEditModal(modal => ({ ...modal, saving: false, error: 'Failed to update caption.' }));
    }
  };

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
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-extrabold text-indigo-600 flex items-center">
            <span className="mr-3">🖼️</span>
            Upload to Gallery
          </h2>
          <p className="text-indigo-600 mt-2">Add images to your photo gallery</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleGalleryImageUpload} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-blue-800">
                Select Images (multiple files supported)
              </label>
              {/* Drag & Drop Zone */}
              <div
                className={`relative group`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="galleryImages"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  multiple
                  required
                />
                <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 transition-all duration-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-blue-400 group-hover:border-blue-600 group-hover:bg-blue-50'}`}>
                  <span className="text-4xl mb-2 text-blue-400">📤</span>
                  <span className="text-blue-700 font-semibold text-base">Drag & Drop or Click to Upload Images</span>
                  <span className="text-blue-400 text-xs mt-1">(JPG, PNG, WEBP up to 5MB each)</span>
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
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-8 py-6 border-b border-blue-100">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-blue-900 flex items-center">
                <span className="mr-3">🖼️</span>
                Gallery Images
              </h2>
              <p className="text-blue-700 mt-1">Manage your photo gallery ({filteredImages.length} images)</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by caption or filename..."
                className="px-4 py-2 border-2 border-blue-200 rounded-xl text-blue-900 bg-white focus:outline-none focus:border-blue-400"
              />
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="px-4 py-2 border-2 border-blue-200 rounded-xl text-blue-900 bg-white focus:outline-none focus:border-blue-400"
                placeholder="From date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="px-4 py-2 border-2 border-blue-200 rounded-xl text-blue-900 bg-white focus:outline-none focus:border-blue-400"
                placeholder="To date"
              />
              <span className="text-sm text-blue-500 bg-blue-100 px-3 py-2 rounded-lg font-medium">
                Total: {filteredImages.length}
              </span>
            </div>
          </div>
        </div>
        <div className="p-8">
          {filteredImages.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedImages.map(image => (
                  <div key={image.id} className="border-2 border-blue-100 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group bg-transparent">
                    <div className="relative">
                      <Image
                        src={image.url}
                        alt={image.caption || 'Gallery image'}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                      <button
                        onClick={() => handleDelete(image.id, image.url)}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        disabled={loading.delete}
                        title="Delete image"
                      >
                        {loading.delete ? <LoadingSpinner size="sm" color="white" /> : '×'}
                      </button>
                      <button
                        onClick={() => setEditModal({ open: true, image, caption: image.caption || '' })}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-blue-600"
                        title="Edit caption"
                      >
                        ✎
                      </button>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-blue-900 truncate">
                        {image.caption || 'Untitled'}
                      </h4>
                      <p className="text-xs text-blue-700">
                        {image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString() : 'No date'}
                      </p>
                      <p className="text-xs text-blue-400 font-mono truncate">
                        {image.fileName}
                      </p>
                    </div>
                  </div>
                ))}
      {/* Edit Caption Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Edit Caption</h3>
            <input
              type="text"
              value={editModal.caption}
              onChange={e => setEditModal(modal => ({ ...modal, caption: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-blue-900 bg-white focus:outline-none focus:border-blue-400 mb-4"
              placeholder="Enter new caption..."
            />
            {editModal.error && <p className="text-red-500 text-sm mb-2">{editModal.error}</p>}
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-bold"
                onClick={() => setEditModal({ open: false, image: null, caption: '' })}
                disabled={editModal.saving}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold"
                onClick={handleEditCaption}
                disabled={editModal.saving}
              >{editModal.saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-blue-900 font-semibold">Page {page} of {totalPages}</span>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold disabled:opacity-50"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-blue-400 text-3xl">🖼️</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">No images in gallery</h3>
              <p className="text-blue-600">Upload your first images to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}