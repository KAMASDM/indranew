"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import EventsAdmin from '../../components/admin/EventsAdmin';
import InitiativesAdmin from '../../components/admin/InitiativesAdmin';
import GalleryAdmin from '../../components/admin/GalleryAdmin';
import VolunteersAdmin from '../../components/admin/VolunteersAdmin';
import MessagesAdmin from '../../components/admin/MessagesAdmin';
import NewsletterAdmin from '../../components/admin/NewsletterAdmin';
import HeroAboutAdmin from '../../components/admin/HeroAboutAdmin';

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

  const fetchAllData = async () => {
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
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getDataCounts = () => {
    return {
      events: data.events.length,
      initiatives: data.initiatives.length,
      media: data.galleryImages.length,
      volunteers: data.volunteers.length,
      messages: data.messages.length,
      subscribers: data.subscribers.length
    };
  };

  const counts = getDataCounts();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-100 border-t-orange-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      );
    }

    const containerClass = "space-y-8 animate-fadeIn";
    
    switch (activeTab) {
      case 'hero':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero & About Management</h2>
                  <p className="text-gray-600">Manage hero images and about us content</p>
                </div>
                <div className="text-6xl opacity-20">🏠</div>
              </div>
            </div>
            <HeroAboutAdmin />
          </div>
        );
      case 'events':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Events Management</h2>
                  <p className="text-gray-600">Create and manage your community events</p>
                </div>
                <div className="text-6xl opacity-20">📅</div>
              </div>
            </div>
            <EventsAdmin events={data.events} fetchAllData={fetchAllData} />
          </div>
        );
      case 'initiatives':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Initiatives Management</h2>
                  <p className="text-gray-600">Organize and showcase your community initiatives</p>
                </div>
                <div className="text-6xl opacity-20">🎯</div>
              </div>
            </div>
            <InitiativesAdmin initiatives={data.initiatives} fetchAllData={fetchAllData} />
          </div>
        );
      case 'media':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Media Gallery</h2>
                  <p className="text-gray-600">Upload and manage your photo gallery</p>
                </div>
                <div className="text-6xl opacity-20">📷</div>
              </div>
            </div>
            <GalleryAdmin galleryImages={data.galleryImages} fetchAllData={fetchAllData} />
          </div>
        );
      case 'volunteers':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Applications</h2>
                  <p className="text-gray-600">Review and manage volunteer applications</p>
                </div>
                <div className="text-6xl opacity-20">👥</div>
              </div>
            </div>
            <VolunteersAdmin volunteers={data.volunteers} fetchAllData={fetchAllData} />
          </div>
        );
      case 'messages':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Messages</h2>
                  <p className="text-gray-600">View and respond to contact form submissions</p>
                </div>
                <div className="text-6xl opacity-20">💬</div>
              </div>
            </div>
            <MessagesAdmin messages={data.messages} fetchAllData={fetchAllData} />
          </div>
        );
      case 'subscribers':
        return (
          <div className={containerClass}>
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h2>
                  <p className="text-gray-600">Manage your newsletter subscriber list</p>
                </div>
                <div className="text-6xl opacity-20">✉️</div>
              </div>
            </div>
            <NewsletterAdmin subscribers={data.subscribers} fetchAllData={fetchAllData} />
          </div>
        );
      default:
        return (
          <div className={containerClass}>
            <EventsAdmin events={data.events} fetchAllData={fetchAllData} />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200 shadow-sm">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            
            {/* Overview Stats */}
            <div className="px-4 mb-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                {navigationItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg">{item.icon}</div>
                    <div className="text-xs font-medium text-gray-600 mt-1">{item.label}</div>
                    <div className="text-lg font-bold text-orange-600">{counts[item.id] || 0}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-orange-100 text-orange-900 border-r-4 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      activeTab === item.id ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {counts[item.id] || 0}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="text-white text-xl">✕</span>
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-8">
                  <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                </div>

                {/* Mobile Overview Stats */}
                <div className="px-4 mb-6">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Overview</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {navigationItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg">{item.icon}</div>
                        <div className="text-xs font-medium text-gray-600 mt-1">{item.label}</div>
                        <div className="text-lg font-bold text-orange-600">{counts[item.id] || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <nav className="mt-8 flex-1 px-2 space-y-1">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg w-full text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-orange-100 text-orange-900'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xl mr-4">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        activeTab === item.id ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {counts[item.id] || 0}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 md:hidden"
            >
              <span className="text-xl">☰</span>
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {navigationItems.find(item => item.id === activeTab)?.icon}
                </span>
                <h1 className="text-lg font-medium text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={fetchAllData}
                  className="text-gray-500 hover:text-gray-700"
                  title="Refresh"
                >
                  <span className="text-lg">🔄</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Header - Desktop */}
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {navigationItems.find(item => item.id === activeTab)?.icon}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your {navigationItems.find(item => item.id === activeTab)?.label.toLowerCase()} and content
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchAllData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                title="Refresh Data"
              >
                <span className="mr-2">🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
          <div className="flex justify-around">
            {navigationItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {counts[item.id] > 0 && (
                  <span className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === item.id ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {counts[item.id]}
                  </span>
                )}
              </button>
            ))}
            {navigationItems.length > 5 && (
              <button className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-600">
                <span className="text-lg">⋯</span>
                <span className="text-xs mt-1 font-medium">More</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}