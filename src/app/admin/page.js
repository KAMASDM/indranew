"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import EventsAdmin from '../../components/admin/EventsAdmin';
import InitiativesAdmin from '../../components/admin/InitiativesAdmin';
import GalleryAdmin from '../../components/admin/GalleryAdmin';
import VolunteersAdmin from '../../components/admin/VolunteersAdmin';
import MessagesAdmin from '../../components/admin/MessagesAdmin';
import NewsletterAdmin from '../../components/admin/NewsletterAdmin';
import HeroAboutAdmin from '../../components/admin/HeroAboutAdmin';
import LoadingSpinner from '../../components/LoadingSpinner';

const navigationItems = [
  { id: 'hero', label: 'Hero & About', icon: '🏠' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'initiatives', label: 'Initiatives', icon: '🎯' },
  { id: 'media', label: 'Media', icon: '📷' },
  { id: 'volunteers', label: 'Volunteers', icon: '👥' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'subscribers', label: 'Newsletter', icon: '✉️' }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    events: [],
    initiatives: [],
    galleryImages: [],
    volunteers: [],
    messages: [],
    subscribers: []
  });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [events, initiatives, gallery, volunteers, messages, subscribers] = await Promise.all([
        getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'initiatives'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'gallery'), orderBy('uploadedAt', 'desc'))),
        getDocs(query(collection(db, 'volunteerApplications'), orderBy('submittedAt', 'desc'))),
        getDocs(query(collection(db, 'contactMessages'), orderBy('submittedAt', 'desc'))),
        getDocs(query(collection(db, 'newsletterSubscribers'), orderBy('subscribedAt', 'desc')))
      ]);

      setData({
        events: events.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        initiatives: initiatives.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        galleryImages: gallery.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        volunteers: volunteers.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        messages: messages.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        subscribers: subscribers.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const counts = {
    events: data.events.length,
    initiatives: data.initiatives.length,
    media: data.galleryImages.length,
    volunteers: data.volunteers.length,
    messages: data.messages.length,
    subscribers: data.subscribers.length
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full p-10">
           <LoadingSpinner size="xl" text="Loading Dashboard Data..."/>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'hero': return <HeroAboutAdmin fetchAllData={fetchAllData} />;
      case 'events': return <EventsAdmin events={data.events} fetchAllData={fetchAllData} />;
      case 'initiatives': return <InitiativesAdmin initiatives={data.initiatives} fetchAllData={fetchAllData} />;
      case 'media': return <GalleryAdmin galleryImages={data.galleryImages} fetchAllData={fetchAllData} />;
      case 'volunteers': return <VolunteersAdmin volunteers={data.volunteers} fetchAllData={fetchAllData} />;
      case 'messages': return <MessagesAdmin messages={data.messages} fetchAllData={fetchAllData} />;
      case 'subscribers': return <NewsletterAdmin subscribers={data.subscribers} fetchAllData={fetchAllData} />;
      default: return <EventsAdmin events={data.events} fetchAllData={fetchAllData} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-72 flex-shrink-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600">&times;</button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-lg w-full text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-4">{item.icon}</span>
                <span>{item.label}</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full font-bold ${
                  activeTab === item.id ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'
                }`}>
                  {counts[item.id] || 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
           <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
           </button>
           <h2 className="text-2xl font-bold text-gray-800">{navigationItems.find(item => item.id === activeTab)?.label}</h2>
           <button onClick={fetchAllData} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l16 16"></path></svg>
            Refresh Data
           </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
