// Enhanced src/components/NewsletterSignup.js
'use client';
import { useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';

const NewsletterSignup = ({ 
  variant = 'default', 
  title = 'Stay Updated', 
  description = 'Subscribe to our newsletter for the latest news and updates.',
  showBenefits = true,
  compact = false 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const benefits = [
    {
      icon: '📧',
      text: 'Monthly impact updates',
      description: 'Get detailed reports on how your support is making a difference'
    },
    {
      icon: '🎯',
      text: 'Exclusive event invites',
      description: 'Be the first to know about volunteer opportunities and special events'
    },
    {
      icon: '💡',
      text: 'Success stories',
      description: 'Read inspiring stories from the communities we serve'
    },
    {
      icon: '🎁',
      text: 'Special updates',
      description: 'Receive updates on new initiatives and partnership opportunities'
    }
  ];

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const checkExistingSubscriber = useCallback(async (email) => {
    try {
      const q = query(
        collection(db, 'newsletterSubscribers'),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing subscriber:', error);
      return false;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Check if email already exists
      const isExistingSubscriber = await checkExistingSubscriber(email);
      
      if (isExistingSubscriber) {
        setError('This email is already subscribed to our newsletter');
        setLoading(false);
        return;
      }

      // Add new subscriber
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: email.trim().toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: 'newsletter_signup',
        status: 'active',
        preferences: {
          monthly_updates: true,
          event_invites: true,
          impact_stories: true
        }
      });
      
      setSubscribed(true);
      setEmail('');
      
      // Reset success state after 10 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 10000);
    } catch (error) {
      console.error("Error subscribing to newsletter: ", error);
      if (error.code === 'permission-denied') {
        setError('Sorry, there was a problem with the subscription service. Please try again later.');
      } else {
        setError('There was an error subscribing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (error) {
      setError('');
    }
  }, [error]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-white/20 backdrop-blur-sm rounded-lg p-6 text-white',
          title: 'text-2xl font-bold mb-4',
          description: 'text-white/90 mb-6',
          form: 'flex flex-col sm:flex-row gap-3',
          input: 'flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm',
          button: 'bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300',
          success: 'bg-green-500/20 border border-green-400/30 text-green-100',
          error: 'text-red-200'
        };
      case 'footer':
        return {
          container: 'bg-gray-800 p-6 rounded-lg',
          title: 'text-lg font-semibold mb-2 text-white',
          description: 'text-gray-400 text-sm mb-4',
          form: 'flex space-x-2',
          input: 'flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm',
          button: 'bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300 text-sm font-medium',
          success: 'bg-green-800 border border-green-600 text-green-300',
          error: 'text-red-400'
        };
      case 'sidebar':
        return {
          container: 'bg-orange-50 border border-orange-200 rounded-lg p-6',
          title: 'text-xl font-bold mb-3 text-gray-800',
          description: 'text-gray-600 mb-4 text-sm',
          form: 'space-y-3',
          input: 'w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900',
          button: 'w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-medium',
          success: 'bg-green-100 border border-green-400 text-green-800',
          error: 'text-red-600'
        };
      default:
        return {
          container: 'bg-gray-100 p-6 rounded-lg',
          title: 'text-lg font-semibold mb-2 text-gray-800',
          description: 'text-gray-600 text-sm mb-4',
          form: 'flex space-x-2',
          input: 'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900',
          button: 'bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-300 text-sm font-medium',
          success: 'bg-green-100 border border-green-400 text-green-700',
          error: 'text-red-600'
        };
    }
  };

  const styles = getVariantStyles();

  if (subscribed) {
    return (
      <div className={`${styles.container} ${styles.success}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Successfully Subscribed!</h3>
          <p className="text-sm opacity-90 mb-4">
            Thank you for joining our newsletter. You&apos;ll receive our latest updates and impact stories.
          </p>
          
          {!compact && (
            <div className="bg-green-500/10 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">What to expect:</h4>
              <div className="text-xs space-y-1">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Monthly impact reports</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Exclusive event invitations</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Community success stories</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSubscribed(false)}
            className="mt-3 text-sm underline opacity-75 hover:opacity-100 transition-opacity duration-200"
          >
            Subscribe another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="relative">
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        {/* Benefits List */}
        {showBenefits && !compact && variant !== 'footer' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-3">
              {benefits.slice(0, variant === 'sidebar' ? 2 : 4).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{benefit.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{benefit.text}</div>
                    {variant !== 'sidebar' && (
                      <div className="text-xs opacity-75">{benefit.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="flex-1 relative">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className={`${styles.input} ${
                error ? 'border-red-500 focus:ring-red-500' : ''
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                focused && !error ? 'ring-2' : ''
              } transition-all duration-200`}
            />
            
            {/* Floating label effect for hero variant */}
            {variant === 'hero' && email && (
              <label className="absolute -top-2 left-2 px-1 bg-white/20 backdrop-blur-sm text-xs text-white/80 rounded">
                Email Address
              </label>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className={`${styles.button} ${
              loading || !email.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform'
            } transition-all duration-200 flex items-center justify-center`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" color="white" />
                <span>Subscribing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Subscribe</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
            )}
          </button>
        </form>

        {error && (
          <div className={`mt-3 text-sm ${styles.error} flex items-center space-x-2`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Privacy Notice */}
        {!compact && (
          <div className="mt-4 text-xs opacity-75">
            <div className="flex items-start space-x-2">
              <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>
                We respect your privacy. Unsubscribe at any time. 
                {variant !== 'footer' && (
                  <span className="block mt-1">
                    By subscribing, you agree to our privacy policy and terms.
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Subscriber count for motivation */}
        {variant === 'default' && !compact && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm opacity-75">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Join 500+ subscribers getting our updates</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterSignup;