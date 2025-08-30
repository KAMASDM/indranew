'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import LoadingSpinner from '../LoadingSpinner';

export default function MessagesAdmin({ messages, fetchAllData }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState({ delete: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    setLoading(prev => ({ ...prev, delete: true }));
    deleteDoc(doc(db, 'contactMessages', id))
      .then(() => { if (fetchAllData) fetchAllData(); })
      .catch(err => { alert('Failed to delete message.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const handleBulkDelete = () => {
    if (!selectedItems.length || !window.confirm(`Delete ${selectedItems.length} selected messages?`)) return;
    setLoading(prev => ({ ...prev, delete: true }));
    Promise.all(selectedItems.map(id => deleteDoc(doc(db, 'contactMessages', id))))
      .then(() => {
        setSelectedItems([]);
        if (fetchAllData) fetchAllData();
      })
      .catch(err => { alert('Failed to delete messages.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchQuery || 
      message.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredMessages.map(m => m.id));
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
            <p className="text-indigo-100 mt-2">Review and manage contact form submissions</p>
          </div>
          <div className="text-white">
            <span className="bg-indigo-400 px-4 py-2 rounded-xl font-bold">
              {filteredMessages.length} Messages
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
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
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
        {filteredMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedItems.length === filteredMessages.length && filteredMessages.length > 0}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map(message => (
                  <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(message.id)}
                        onChange={(e) => handleSelectItem(message.id, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {message.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{message.name}</div>
                          <div className="text-sm text-gray-500">
                            <a href={`mailto:${message.email}`} className="text-indigo-600 hover:text-indigo-900 transition-colors">
                              {message.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs">
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        <div className="truncate">{message.message}</div>
                        {message.message?.length > 100 && (
                          <button className="text-indigo-600 hover:text-indigo-900 text-xs mt-1 font-medium">
                            Read more
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {message.submittedAt ? new Date(message.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {message.submittedAt ? new Date(message.submittedAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <a
                          href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Hi ${message.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
                        >
                          Reply
                        </a>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                          disabled={loading.delete}
                        >
                          {loading.delete ? <LoadingSpinner size="sm" color="gray" /> : 'Delete'}
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
              {searchQuery ? 'No messages found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms.' : 'Contact form submissions will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}