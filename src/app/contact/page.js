// Enhanced src/app/contact/page.js
'use client';
import { useState, useCallback, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const formRef = useRef(null);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: '💬' },
    { value: 'volunteer', label: 'Volunteer Opportunity', icon: '🤝' },
    { value: 'donation', label: 'Donation Related', icon: '💝' },
    { value: 'partnership', label: 'Partnership/Collaboration', icon: '🤝' },
    { value: 'media', label: 'Media Inquiry', icon: '📰' },
    { value: 'support', label: 'Need Help/Support', icon: '🆘' }
  ];

  const contactInfo = [
    {
      title: 'Visit Us',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      details: [
        'Indraprasth Foundation',
        'Vadodara, Gujarat, India',
        'Office Hours: Mon-Sat 9AM-6PM'
      ],
      action: {
        text: 'Get Directions',
        href: 'https://maps.google.com/?q=Vadodara,Gujarat,India'
      }
    },
    {
      title: 'Call Us',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
      ),
      details: [
        '+91 8780899424',
        'Available: Mon-Fri 9AM-7PM',
        'Emergency: 24/7'
      ],
      action: {
        text: 'Call Now',
        href: 'tel:+918780899424'
      }
    },
    {
      title: 'Email Us',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      details: [
        'contact@indraprasthfoundation.org',
        'Response time: Within 24 hours'
      ],
      action: {
        text: 'Send Email',
        href: 'mailto:contact@indraprasth.org'
      }
    },
    {
      title: 'Follow Us',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v4a1 1 0 01-1 1h-4v4a1 1 0 01-1 1H8a1 1 0 01-1-1v-4H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"></path>
        </svg>
      ),
      details: [
        'Facebook: /IndraprathFoundation',
        'Instagram: @indraprasth_foundation',
        'Stay updated with our work'
      ],
      action: {
        text: 'Follow Us',
        href: '#'
      }
    }
  ];

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
      }
      return;
    }

    setLoading(true);
    
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        submittedAt: serverTimestamp(),
        status: 'unread'
      });
      
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      console.error("Error submitting message: ", error);
      setErrors({ submit: "There was an error sending your message. Please try again or contact us directly." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Message Sent Successfully!</h2>
              <p className="text-green-700 mb-6">
                Thank you for reaching out to us. We&apos;ve received your message and will get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Send Another Message
                </button>
                <Link
                  href="/"
                  className="text-green-600 hover:text-green-800 px-6 py-2 rounded-lg border border-green-600 hover:bg-green-50 transition duration-300"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-orange-400 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 text-center py-20">
            <div className="container mx-auto px-6">
              <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
              <div className="flex justify-center space-x-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold">24hrs</div>
                  <div className="text-sm">Response Time</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm">Reply Rate</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-2xl font-bold">5⭐</div>
                  <div className="text-sm">Support Rating</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Send us a Message</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {errors.submit}
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What can we help you with? *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {inquiryTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.inquiryType === type.value
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="inquiryType"
                            value={type.value}
                            checked={formData.inquiryType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-lg mr-2">{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      error={errors.name}
                      focused={focusedField === 'name'}
                      required
                    />
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      error={errors.email}
                      focused={focusedField === 'email'}
                      required
                    />
                  </div>

                  {/* Phone and Subject Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      error={errors.phone}
                      focused={focusedField === 'phone'}
                      placeholder="+91 12345 67890"
                    />
                    <FormField
                      label="Subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      error={errors.subject}
                      focused={focusedField === 'subject'}
                      required
                    />
                  </div>

                  {/* Message */}
                  <FormField
                    label="Message"
                    name="message"
                    type="textarea"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    error={errors.message}
                    focused={focusedField === 'message'}
                    rows={6}
                    required
                    placeholder="Tell us more about your inquiry..."
                  />

                  {/* Character Count */}
                  <div className="text-right">
                    <span className={`text-sm ${
                      formData.message.length >= 20 ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {formData.message.length} characters (minimum 20)
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
              
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <div className="text-orange-600">
                        {info.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-600 text-sm">
                            {detail}
                          </p>
                        ))}
                      </div>
                      <a
                        href={info.action.href}
                        target={info.action.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm mt-3 group"
                      >
                        {info.action.text}
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Emergency Contact */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <h3 className="font-semibold text-red-800">Emergency Contact</h3>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  For urgent matters or if you need immediate assistance, please call our emergency helpline.
                </p>
                <a
                  href="tel:+911234567890"
                  className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 text-sm font-medium"
                >
                  📞 Call Emergency Line
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Enhanced Form Field Component
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  focused,
  required = false,
  placeholder = '',
  rows = 4
}) => (
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
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error 
            ? 'border-red-500 bg-red-50' 
            : focused 
              ? 'border-orange-300 bg-orange-50' 
              : 'border-gray-300 hover:border-gray-400'
        } text-gray-900`}
      />
    ) : (
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error 
            ? 'border-red-500 bg-red-50' 
            : focused 
              ? 'border-orange-300 bg-orange-50' 
              : 'border-gray-300 hover:border-gray-400'
        } text-gray-900`}
      />
    )}
    {error && (
      <p className="text-red-500 text-sm mt-1 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        {error}
      </p>
    )}
  </div>
);

export default ContactPage;