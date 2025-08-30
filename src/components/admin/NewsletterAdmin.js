'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import LoadingSpinner from '../LoadingSpinner';

export default function NewsletterAdmin({ subscribers, fetchAllData }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState({ delete: false, export: false });
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    setLoading(prev => ({ ...prev, delete: true }));
    deleteDoc(doc(db, 'newsletterSubscribers', id))
      .then(() => { if (fetchAllData) fetchAllData(); })
      .catch(err => { alert('Failed to delete subscriber.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const handleBulkDelete = () => {
    if (!selectedItems.length || !window.confirm(`Delete ${selectedItems.length} selected subscribers?`)) return;
    setLoading(prev => ({ ...prev, delete: true }));
    Promise.all(selectedItems.map(id => deleteDoc(doc(db, 'newsletterSubscribers', id))))
      .then(() => {
        setSelectedItems([]);
        if (fetchAllData) fetchAllData();
      })
      .catch(err => { alert('Failed to delete subscribers.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const handleExportCSV = () => {
    setLoading(prev => ({ ...prev, export: true }));
    
    try {
      const csvContent = [
        ['Email', 'Subscribed Date', 'Subscribed Time'].join(','),
        ...filteredSubscribers.map(sub => [
          sub.email,
          sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : 'N/A',
          sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleTimeString() : 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = !searchQuery || 
      subscriber.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredSubscribers.map(s => s.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // Group subscribers by month for stats
  const getSubscriptionStats = () => {
    const stats = {};
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push({ key: monthKey, name: monthName });
      stats[monthKey] = 0;
    }

    subscribers.forEach(sub => {
      if (sub.subscribedAt) {
        const date = new Date(sub.subscribedAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (stats[monthKey] !== undefined) {
          stats[monthKey]++;
        }
      }
    });

    return { stats, months: last6Months };
  };

  const { stats, months } = getSubscriptionStats();

  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">Newsletter Statistics</h3>
          <p className="text-teal-100 mt-2">Subscriber growth over the last 6 months</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {months.map(month => (
              <div key={month.key} className="text-center">
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <div className="text-2xl font-bold text-teal-600">{stats[month.key]}</div>
                  <div className="text-sm text-gray-600 font-medium">{month.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border border-teal-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{subscribers.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {subscribers.filter(s => {
                    const subDate = new Date(s.subscribedAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return subDate > monthAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600 font-medium">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {subscribers.filter(s => {
                    const subDate = new Date(s.subscribedAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return subDate > weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-600 font-medium">This Week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Management */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Newsletter Subscribers</h2>
              <p className="text-teal-100 mt-2">Manage your newsletter subscriber list</p>
            </div>
            <div className="text-white">
              <span className="bg-teal-400 px-4 py-2 rounded-xl font-bold">
                {filteredSubscribers.length} Subscribers
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-colors"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                disabled={loading.export}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50 whitespace-nowrap"
              >
                {loading.export ? <LoadingSpinner size="sm" color="white" /> : 'Export CSV'}
              </button>
            </div>
            
            {selectedItems.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedItems.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={loading.delete}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {loading.delete ? <LoadingSpinner size="sm" color="white" /> : 'Delete Selected'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-hidden">
          {filteredSubscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedItems.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                        className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subscriber</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subscribed Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map(subscriber => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(subscriber.id)}
                          onChange={(e) => handleSelectItem(subscriber.id, e.target.checked)}
                          className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {subscriber.email?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              <a 
                                href={`mailto:${subscriber.email}`} 
                                className="text-teal-600 hover:text-teal-900 transition-colors"
                              >
                                {subscriber.email}
                              </a>
                            </div>
                            <div className="text-xs text-gray-500">
                              Newsletter Subscriber
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleTimeString() : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <a
                            href={`mailto:${subscriber.email}?subject=Newsletter Update&body=Hi there,%0D%0A%0D%0AThank you for subscribing to our newsletter.%0D%0A%0D%0ABest regards`}
                            className="text-teal-600 hover:text-teal-900 text-sm font-medium transition-colors"
                          >
                            Email
                          </a>
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                            disabled={loading.delete}
                          >
                            {loading.delete ? <LoadingSpinner size="sm" color="gray" /> : 'Unsubscribe'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery ? 'No subscribers found' : 'No newsletter subscribers yet'}
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms.' : 'Newsletter subscribers will appear here when they sign up.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}