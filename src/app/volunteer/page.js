// Enhanced src/app/volunteer/page.js
'use client';
import { useState, useCallback, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    occupation: '',
    skills: [],
    availability: [],
    experience: '',
    motivation: '',
    emergencyContact: '',
    hearAboutUs: '',
    agreement: false
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const formRef = useRef(null);

  const skillsOptions = [
    { id: 'cooking', name: 'Cooking & Food Preparation', icon: '👨‍🍳' },
    { id: 'teaching', name: 'Teaching & Tutoring', icon: '👩‍🏫' },
    { id: 'healthcare', name: 'Healthcare & Medical', icon: '👩‍⚕️' },
    { id: 'it', name: 'IT & Technology', icon: '💻' },
    { id: 'photography', name: 'Photography & Videography', icon: '📸' },
    { id: 'social-media', name: 'Social Media & Marketing', icon: '📱' },
    { id: 'fundraising', name: 'Fundraising & Events', icon: '💰' },
    { id: 'administration', name: 'Administration & Management', icon: '📋' },
    { id: 'transport', name: 'Transportation & Logistics', icon: '🚐' },
    { id: 'counseling', name: 'Counseling & Support', icon: '🤗' },
    { id: 'translation', name: 'Translation & Languages', icon: '🗣️' },
    { id: 'construction', name: 'Construction & Repairs', icon: '🔨' }
  ];

  const availabilityOptions = [
    { id: 'weekdays', name: 'Weekdays (Mon-Fri)', icon: '📅' },
    { id: 'weekends', name: 'Weekends (Sat-Sun)', icon: '🗓️' },
    { id: 'mornings', name: 'Mornings (6AM-12PM)', icon: '🌅' },
    { id: 'afternoons', name: 'Afternoons (12PM-6PM)', icon: '☀️' },
    { id: 'evenings', name: 'Evenings (6PM-10PM)', icon: '🌆' },
    { id: 'flexible', name: 'Flexible Schedule', icon: '⏰' }
  ];

  const volunteerBenefits = [
    {
      title: 'Make a Real Impact',
      description: 'Directly contribute to improving lives in your community',
      icon: '💝'
    },
    {
      title: 'Gain New Skills',
      description: 'Learn valuable skills while helping others',
      icon: '📈'
    },
    {
      title: 'Meet Like-minded People',
      description: 'Connect with passionate individuals who care about making a difference',
      icon: '🤝'
    },
    {
      title: 'Flexible Commitment',
      description: 'Volunteer according to your schedule and availability',
      icon: '⏰'
    },
    {
      title: 'Personal Growth',
      description: 'Experience personal satisfaction and growth through service',
      icon: '🌱'
    },
    {
      title: 'Community Recognition',
      description: 'Receive certificates and recognition for your contributions',
      icon: '🏆'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Teaching Volunteer',
      quote: 'Volunteering with Indraprasth Foundation has been incredibly fulfilling. Seeing children learn and grow brings so much joy.',
      image: '/volunteer-1.jpg',
      duration: '2 years'
    },
    {
      name: 'Raj Patel',
      role: 'Kitchen Volunteer',
      quote: 'Being part of the Rasodu initiative has taught me the true meaning of service. Every meal we serve makes a difference.',
      image: '/volunteer-2.jpg',
      duration: '3 years'
    },
    {
      name: 'Anita Desai',
      role: 'Event Coordinator',
      quote: 'The foundation has given me a platform to use my organizational skills for a great cause. The team is amazing!',
      image: '/volunteer-3.jpg',
      duration: '1 year'
    }
  ];

  const validateStep = useCallback((step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.age.trim()) {
        newErrors.age = 'Age is required';
      } else if (isNaN(formData.age) || formData.age < 16 || formData.age > 80) {
        newErrors.age = 'Age must be between 16 and 80';
      }
    } else if (step === 2) {
      if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
      if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';
    } else if (step === 3) {
      if (!formData.motivation.trim()) {
        newErrors.motivation = 'Please tell us why you want to volunteer';
      } else if (formData.motivation.trim().length < 50) {
        newErrors.motivation = 'Please provide more details (at least 50 characters)';
      }
      if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
      if (!formData.agreement) newErrors.agreement = 'You must agree to our terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSkillToggle = useCallback((skillId) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
    }));
    
    if (errors.skills) {
      setErrors(prev => ({ ...prev, skills: '' }));
    }
  }, [errors.skills]);

  const handleAvailabilityToggle = useCallback((availabilityId) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(availabilityId)
        ? prev.availability.filter(id => id !== availabilityId)
        : [...prev.availability, availabilityId]
    }));
    
    if (errors.availability) {
      setErrors(prev => ({ ...prev, availability: '' }));
    }
  }, [errors.availability]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setLoading(true);
    
    try {
      // Convert arrays to strings for Firestore
      const submissionData = {
        ...formData,
        skills: formData.skills.join(', '),
        availability: formData.availability.join(', '),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        submittedAt: serverTimestamp(),
        status: 'pending'
      };

      await addDoc(collection(db, 'volunteerApplications'), submissionData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application: ", error);
      setErrors({ submit: "There was an error submitting your application. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-4">Application Submitted Successfully!</h1>
              <p className="text-lg text-green-700 mb-6">
                Thank you for your interest in volunteering with Indraprasth Foundation.
                We&apos;ve received your application and will review it within 3-5 business days.
              </p>
              <div className="bg-green-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-green-800 mb-3">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">1</span>
                    </div>
                    <p className="text-green-700">We&apos;ll review your application and skills</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">2</span>
                    </div>
                    <p className="text-green-700">Our team will contact you for a brief interview</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">3</span>
                    </div>
                    <p className="text-green-700">We&apos;ll match you with suitable volunteer opportunities</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-800 text-xs font-bold">4</span>
                    </div>
                    <p className="text-green-700">You&apos;ll start making a difference in your community!</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setCurrentStep(1);
                    setFormData({
                      name: '', email: '', phone: '', age: '', occupation: '',
                      skills: [], availability: [], experience: '', motivation: '',
                      emergencyContact: '', hearAboutUs: '', agreement: false
                    });
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                >
                  Submit Another Application
                </button>
                <Link
                  href="/"
                  className="text-green-600 hover:text-green-800 px-6 py-3 rounded-lg border border-green-600 hover:bg-green-50 transition duration-300 font-semibold"
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
        <header className="bg-orange-100 text-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 text-center py-20">
            <div className="container mx-auto px-6">
              <h1 className="text-5xl font-bold mb-4">Become a Volunteer</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Join our passionate community of volunteers and help us create lasting positive change 
                in the lives of those who need it most
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">150+</div>
                  <div className="text-sm opacity-90">Active Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">12</div>
                  <div className="text-sm opacity-90">Different Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm opacity-90">Impact Creation</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          {/* Benefits Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Volunteer With Us?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Volunteering with Indraprasth Foundation offers countless benefits beyond just helping others
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {volunteerBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Volunteers Say</h2>
              <p className="text-lg text-gray-600">Hear from our amazing volunteers about their experiences</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-600 font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-orange-600">{testimonial.duration} volunteer</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">&quot;{testimonial.quote}&quot;</p>
                </div>
              ))}
            </div>
          </section>

          {/* Application Form */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Progress Bar */}
              <div className="bg-orange-50 px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Volunteer Application</h2>
                  <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                        step <= currentStep ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Personal Info</span>
                  <span>Skills & Availability</span>
                  <span>Final Details</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {errors.submit}
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            required
                          />
                          <FormField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={errors.email}
                            required
                          />
                          <FormField
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                            required
                          />
                          <FormField
                            label="Age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            error={errors.age}
                            required
                            min="16"
                            max="80"
                          />
                        </div>
                        <div className="mt-6">
                          <FormField
                            label="Occupation/Profession"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                            placeholder="e.g., Student, Teacher, Engineer, Retired"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Skills & Availability */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      {/* Skills */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Skills & Interests</h3>
                        <p className="text-gray-600 mb-4">Select the skills you&apos;d like to contribute (select multiple):</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {skillsOptions.map((skill) => (
                            <label
                              key={skill.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.skills.includes(skill.id)
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.skills.includes(skill.id)}
                                onChange={() => handleSkillToggle(skill.id)}
                                className="sr-only"
                              />
                              <span className="text-lg mr-3">{skill.icon}</span>
                              <span className="text-sm font-medium">{skill.name}</span>
                            </label>
                          ))}
                        </div>
                        {errors.skills && <p className="text-red-500 text-sm mt-2">{errors.skills}</p>}
                      </div>

                      {/* Availability */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Availability</h3>
                        <p className="text-gray-600 mb-4">When are you available to volunteer?</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {availabilityOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                formData.availability.includes(option.id)
                                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.availability.includes(option.id)}
                                onChange={() => handleAvailabilityToggle(option.id)}
                                className="sr-only"
                              />
                              <span className="text-lg mr-3">{option.icon}</span>
                              <span className="text-sm font-medium">{option.name}</span>
                            </label>
                          ))}
                        </div>
                        {errors.availability && <p className="text-red-500 text-sm mt-2">{errors.availability}</p>}
                      </div>

                      {/* Experience */}
                      <div>
                        <FormField
                          label="Previous Volunteer Experience (Optional)"
                          name="experience"
                          type="textarea"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Tell us about any previous volunteer work or community involvement..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Final Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Final Details</h3>
                        
                        <FormField
                          label="Why do you want to volunteer with us?"
                          name="motivation"
                          type="textarea"
                          value={formData.motivation}
                          onChange={handleInputChange}
                          error={errors.motivation}
                          placeholder="Share your motivation and what you hope to achieve through volunteering..."
                          rows={4}
                          required
                        />
                        
                        <div className="mt-4 text-right">
                          <span className={`text-sm ${
                            formData.motivation.length >= 50 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {formData.motivation.length} characters (minimum 50)
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          label="Emergency Contact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          error={errors.emergencyContact}
                          placeholder="Name and phone number"
                          required
                        />
                        <FormField
                          label="How did you hear about us?"
                          name="hearAboutUs"
                          value={formData.hearAboutUs}
                          onChange={handleInputChange}
                          placeholder="e.g., Social media, Friend, Website..."
                        />
                      </div>

                      {/* Agreement Checkbox */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            name="agreement"
                            checked={formData.agreement}
                            onChange={handleInputChange}
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <div className="text-sm text-gray-700">
                            <p className="font-medium mb-1">Terms & Conditions Agreement *</p>
                            <p>
                              I agree to the volunteer terms and conditions, understand that volunteer work is unpaid, 
                              and commit to representing Indraprasth Foundation in a positive manner. I consent to 
                              background verification if required.
                            </p>
                          </div>
                        </label>
                        {errors.agreement && <p className="text-red-500 text-sm mt-2">{errors.agreement}</p>}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                        currentStep === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-300"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span className="ml-2">Submitting...</span>
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Form Field Component
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder = '',
  rows = 4,
  min,
  max
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
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } text-gray-900`}
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
        min={min}
        max={max}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        } text-gray-900`}
      />
    )}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default VolunteerPage;