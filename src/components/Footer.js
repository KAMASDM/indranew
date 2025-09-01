// Enhanced src/components/Footer.js
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: email.trim().toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: 'footer_signup'
      });
      
      setSubscribed(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      console.error("Error subscribing to newsletter: ", error);
      if (error.code === 'permission-denied') {
        setError('Sorry, there was a problem with the subscription. Please try again later.');
      } else {
        setError(error.message || 'There was an error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const footerSections = [
    {
      title: 'Our Foundation',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/initiatives', label: 'Our Initiatives' },
        { href: '/events', label: 'Events & Activities' },
        { href: '/gallery', label: 'Photo Gallery' },
        { href: '/admin', label: 'Admin Portal' }
      ]
    },
    {
      title: 'Get Involved',
      links: [
        { href: '/donate', label: 'Make a Donation' },
        { href: '/volunteer', label: 'Become a Volunteer' },
        { href: '/contact', label: 'Partner with Us' },
        { href: '/contact', label: 'Corporate CSR' },
        { href: '/contact', label: 'Sponsor an Event' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { href: '/blog', label: 'Latest News' },
        { href: '/impact', label: 'Impact Reports' },
        { href: '/transparency', label: 'Financial Transparency' },
        { href: '/careers', label: 'Careers' },
        { href: '/contact', label: 'Media Kit' }
      ]
    }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.247 7.152 7.757 8.449 7.757s2.448.49 3.324 1.297c.806.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324C10.897 16.498 9.746 16.988 8.449 16.988z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const contactInfo = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      label: 'Address',
      value: 'Vadodara, Gujarat, India',
      link: 'https://maps.google.com/?q=Vadodara,Gujarat,India'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      label: 'Email',
      value: 'contact@indraprasthfoundation.org',
      link: 'mailto:contact@indraprasthfoundation.org'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
      ),
      label: 'Phone',
      value: '+91 8780899424',
      link: 'tel:+918780899424'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Foundation Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="Indraprasth Foundation Logo" 
                  width={60} 
                  height={60} 
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
              </div>
              <div>
                <span className="text-2xl font-bold group-hover:text-teal-300 transition-colors duration-300">
                  Indraprasth Foundation
                </span>
                <p className="text-sm text-gray-400">Serving Humanity with Compassion</p>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 text-sm leading-relaxed max-w-md">
              Dedicated to uplifting the community of Vadodara through various initiatives in education, health, and community welfare. Together, we&apos;re building a better tomorrow for those who need it most.
            </p>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-teal-300">200K+</div>
                <div className="text-xs text-gray-400">Meals Served</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-teal-300">5K+</div>
                <div className="text-xs text-gray-400">Lives Impacted</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="bg-gray-800 p-3 rounded-full hover:bg-teal-500 transition-all duration-300 transform hover:scale-110 group"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-300">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-6 text-teal-300 relative">
                {section.title}
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-teal-500"></span>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-teal-300 transition-colors duration-200 text-sm flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter & Contact */}
        <div className="grid md:grid-cols-2 gap-8 py-8 border-t border-gray-800">
          {/* Newsletter Signup */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-teal-300">Stay Connected</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest updates on our initiatives and impact stories.
            </p>
            
            {subscribed ? (
              <div className="bg-green-800 border border-green-600 text-green-300 px-4 py-3 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="font-semibold">Thank you for subscribing!</span>
                </div>
                <p className="text-sm mt-1">You&apos;ll receive our latest updates soon.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-gray-400 text-sm transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-teal-600 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium flex items-center"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-teal-300 relative">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-teal-500"></span>
            </h3>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-400 hover:text-teal-300 transition-colors duration-200 group">
                  <div className="text-teal-400 group-hover:text-teal-300 flex-shrink-0">
                    {contact.icon}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{contact.label}</div>
                    {contact.link ? (
                      <a 
                        href={contact.link}
                        target={contact.link.startsWith('http') ? '_blank' : undefined}
                        rel={contact.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="hover:underline"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <span>{contact.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Contact Form Link */}
            <div className="mt-6">
              <Link 
                href="/contact"
                className="inline-flex items-center text-teal-400 hover:text-teal-300 text-sm font-medium group"
              >
                <span>Send us a message</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              &copy; {currentYear} Indraprasth Foundation. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-teal-300 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-teal-300 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/transparency" className="text-gray-400 hover:text-teal-300 transition-colors duration-200">
                Financial Transparency
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-teal-300 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
          
          {/* Trust & Certification Badges */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span>Registered Charity</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Transparent Operations</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>Community Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;