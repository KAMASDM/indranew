'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import LoadingSpinner from '../LoadingSpinner';

export default function VolunteersAdmin({ volunteers, fetchAllData }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState({ delete: false });
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this volunteer application?')) return;
    setLoading(prev => ({ ...prev, delete: true }));
    deleteDoc(doc(db, 'volunteerApplications', id))
      .then(() => { if (fetchAllData) fetchAllData(); })
      .catch(err => { alert('Failed to delete volunteer.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const handleBulkDelete = () => {
    if (!selectedItems.length || !window.confirm(`Delete ${selectedItems.length} selected applications?`)) return;
    setLoading(prev => ({ ...prev, delete: true }));
    Promise.all(selectedItems.map(id => deleteDoc(doc(db, 'volunteerApplications', id))))
      .then(() => {
        setSelectedItems([]);
        if (fetchAllData) fetchAllData();
      })
      .catch(err => { alert('Failed to delete applications.'); console.error(err); })
      .finally(() => setLoading(prev => ({ ...prev, delete: false })));
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = !searchQuery || 
      volunteer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredVolunteers.map(v => v.id));
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Volunteer Applications</h2>
            <p className="text-green-100 mt-2">Review and manage volunteer applications</p>
          </div>
          <div className="text-white">
            <span className="bg-green-400 px-4 py-2 rounded-xl font-bold">
              {filteredVolunteers.length} Applications
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
                placeholder="Search volunteers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-colors"
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
      
      <div className="p-8">
        {filteredVolunteers.length > 0 ? (
          <div className="grid gap-6">
            {filteredVolunteers.map(volunteer => (
              <div key={volunteer.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-green-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(volunteer.id)}
                      onChange={(e) => handleSelectItem(volunteer.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {volunteer.name?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors">
                          {volunteer.name}
                        </h3>
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          Applied: {volunteer.submittedAt ? new Date(volunteer.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a 
                              href={`mailto:${volunteer.email}`} 
                              className="text-green-600 hover:text-green-800 font-medium transition-colors"
                            >
                              {volunteer.email}
                            </a>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a 
                              href={`tel:${volunteer.phone}`} 
                              className="text-green-600 hover:text-green-800 font-medium transition-colors"
                            >
                              {volunteer.phone}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs text-gray-500">
                            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                              <span className="font-medium text-green-800">Status:</span> New Application
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="font-semibold text-gray-800 mb-2 text-sm">Volunteer Message:</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{volunteer.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`mailto:${volunteer.email}?subject=Volunteer Application - ${volunteer.name}&body=Hi ${volunteer.name},%0D%0A%0D%0AThank you for your interest in volunteering with us.%0D%0A%0D%0ABest regards`}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                      >
                        Contact
                      </a>
                      <button
                        onClick={() => handleDelete(volunteer.id)}
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading.delete}
                        title="Delete application"
                      >
                        {loading.delete ? <LoadingSpinner size="sm" color="gray" /> : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? 'No volunteers found' : 'No volunteer applications yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms.' : 'Volunteer applications will appear here when submitted.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}