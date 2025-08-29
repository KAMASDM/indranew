// src/components/NewsletterSignup.js
'use client';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: email,
        subscribedAt: serverTimestamp(),
      });
      setSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error("Error subscribing to newsletter: ", error);
      alert("There was an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
        <p className="font-semibold">Thank you for subscribing!</p>
        <p className="text-sm">You'll receive updates about our latest initiatives.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Stay Updated</h3>
      <p className="text-gray-600 text-sm mb-4">Subscribe to our newsletter for the latest news and updates.</p>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300 disabled:bg-gray-400 text-sm font-medium"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};

export default NewsletterSignup;