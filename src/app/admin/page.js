// src/app/admin/page.js
'use client';
import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingSpinner from '../../components/LoadingSpinner';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventDescription: '',
    initiativeTitle: '',
    initiativeDescription: '',
    initiativeSlug: ''
  });

  const [files, setFiles] = useState({
    heroImage: null,
    galleryImage: null,
    initiativeImage: null
  });

  const [galleryCaption, setGalleryCaption] = useState('');
  const [loading, setLoading] = useState({ 
    event: false, 
    hero: false, 
    gallery: false, 
    initiative: false,
    fetch: false 
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      // Fetch events
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'));
      const eventsSnapshot = await getDocs(eventsQuery);
      setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch contact messages
      const messagesQuery = query(collection(db, 'contactMessages'), orderBy('submittedAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch volunteer applications
      const volunteersQuery = query(collection(db, 'volunteerApplications'), orderBy('submittedAt', 'desc'));
      const volunteersSnapshot = await getDocs(volunteersQuery);
      setVolunteers(volunteersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch newsletter subscribers
      const subscribersQuery = query(collection(db, 'newsletterSubscribers'), orderBy('subscribedAt', 'desc'));
      const subscribersSnapshot = await getDocs(subscribersQuery);
      setSubscribers(subscribersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, event: true }));
    try {
      await addDoc(collection(db, 'events'), {
        name: formData.eventName,
        date: formData.eventDate,
        description: formData.eventDescription,
        createdAt: serverTimestamp()
      });
      alert('Event added successfully!');
      setFormData({ ...formData, eventName: '', eventDate: '', eventDescription: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error adding event: ', error);
      alert('Failed to add event.');
    } finally {
      setLoading(prev => ({ ...prev, event: false }));
    }
  };

  const handleAddInitiative = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, initiative: true }));
    
    try {
      let imageUrl = '';
      if (files.initiativeImage) {
        const storageRef = ref(storage, `initiatives/${Date.now()}_${files.initiativeImage.name}`);
        await uploadBytes(storageRef, files.initiativeImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'initiatives'), {
        title: formData.initiativeTitle,
        description: formData.initiativeDescription,
        slug: formData.initiativeSlug,
        imageUrl: imageUrl,
        createdAt: serverTimestamp()
      });

      alert('Initiative added successfully!');
      setFormData({ 
        ...formData, 
        initiativeTitle: '', 
        initiativeDescription: '', 
        initiativeSlug: '' 
      });
      setFiles({ ...files, initiativeImage: null });
    } catch (error) {
      console.error('Error adding initiative:', error);
      alert('Failed to add initiative.');
    } finally {
      setLoading(prev => ({ ...prev, initiative: false }));
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
    setLoading(prev => ({ ...prev, hero: true }));
    try {
      await handleImageUpload(files.heroImage, 'hero-images', 'heroImages');
      alert('Hero image uploaded successfully!');
      setFiles({ ...files, heroImage: null });
    } catch (error) {
      console.error('Error uploading hero image:', error);
      alert('Failed to upload hero image.');
    } finally {
      setLoading(prev => ({ ...prev, hero: false }));
    }
  };

  const handleGalleryImageUpload = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, gallery: true }));
    try {
      await handleImageUpload(files.galleryImage, 'gallery-images', 'gallery', galleryCaption);
      alert('Gallery image uploaded successfully!');
      setFiles({ ...files, galleryImage: null });
      setGalleryCaption('');
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      alert('Failed to upload gallery image.');
    } finally {
      setLoading(prev => ({ ...prev, gallery: false }));
    }
  };

  const deleteItem = async (collection_name, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collection_name, id));
        alert('Item deleted successfully!');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item.');
      }
    }
  };

  const tabs = [
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'initiatives', label: 'Initiatives', icon: '🎯' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'volunteers', label: 'Volunteers', icon: '🤝' },
    { id: 'subscribers', label: 'Subscribers', icon: '📧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your foundation's content and data</p>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading.fetch ? (
          <div className="text-center py-12">
            <LoadingSpinner size="xl" />
            <p className="text-gray-500 mt-4">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Add New Event</h2>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <FormField
                      label="Event Name"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Event Date"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Description"
                      name="eventDescription"
                      type="textarea"
                      value={formData.eventDescription}
                      onChange={handleInputChange}
                      rows={3}
                    />
                    <SubmitButton loading={loading.event} text="Add Event" />
                  </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {events.map(event => (
                      <div key={event.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => deleteItem('events', event.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Initiatives Tab */}
            {activeTab === 'initiatives' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Add New Initiative</h2>
                <form onSubmit={handleAddInitiative} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Initiative Title"
                      name="initiativeTitle"
                      value={formData.initiativeTitle}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Slug (URL identifier)"
                      name="initiativeSlug"
                      value={formData.initiativeSlug}
                      onChange={handleInputChange}
                      placeholder="e.g., food-distribution-program"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initiative Image
                      </label>
                      <input
                        type="file"
                        name="initiativeImage"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div>
                    <FormField
                      label="Description"
                      name="initiativeDescription"
                      type="textarea"
                      value={formData.initiativeDescription}
                      onChange={handleInputChange}
                      rows={8}
                      required
                    />
                    <SubmitButton loading={loading.initiative} text="Add Initiative" className="mt-4" />
                  </div>
                </form>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Upload Hero Image</h2>
                  <form onSubmit={handleHeroImageUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Image (latest one will be displayed)
                      </label>
                      <input
                        type="file"
                        name="heroImage"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        accept="image/*"
                        required
                      />
                    </div>
                    <SubmitButton loading={loading.hero} text="Upload Hero Image" />
                  </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold mb-4">Upload to Gallery</h2>
                  <form onSubmit={handleGalleryImageUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Image
                      </label>
                      <input
                        type="file"
                        name="galleryImage"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        accept="image/*"
                        required
                      />
                    </div>
                    <FormField
                      label="Caption (Optional)"
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                    />
                    <SubmitButton loading={loading.gallery} text="Upload to Gallery" />
                  </form>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Contact Messages</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messages.map(message => (
                        <tr key={message.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {message.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => deleteItem('contactMessages', message.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Volunteers Tab */}
            {activeTab === 'volunteers' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Volunteer Applications</h2>
                <div className="grid gap-4">
                  {volunteers.map(volunteer => (
                    <div key={volunteer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                          <p className="text-gray-600">{volunteer.email}</p>
                          <p className="text-gray-600">{volunteer.phone}</p>
                          <p className="mt-2 text-sm text-gray-700">{volunteer.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {volunteer.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteItem('volunteerApplications', volunteer.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Newsletter Subscribers</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribers.map(subscriber => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscriber.subscribedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => deleteItem('newsletterSubscribers', subscriber.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const FormField = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '', rows = 3 }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
      />
    )}
  </div>
);

const SubmitButton = ({ loading, text, className = '' }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition duration-300 disabled:bg-gray-400 flex items-center justify-center ${className}`}
  >
    {loading ? (
      <>
        <LoadingSpinner size="sm" color="white" />
        <span className="ml-2">Processing...</span>
      </>
    ) : (
      text
    )}
  </button>
);

export default Admin;