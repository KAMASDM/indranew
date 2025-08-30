// Enhanced src/components/Testimonials.js
'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Testimonials = ({ 
  variant = 'default', 
  showNavigation = true, 
  autoPlay = true,
  customTestimonials = null,
  title = "What People Are Saying",
  subtitle = "Real stories from the people we've touched."
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const intervalRef = useRef(null);

  const defaultTestimonials = [
    {
      id: 1,
      quote: "The free meal program by Indraprasth Foundation is a blessing for daily wage workers like me. Their work is truly life-saving and gives us hope every day.",
      name: "Ramesh Patel",
      title: "Daily Wage Worker",
      category: "Community Member",
      location: "Vadodara, Gujarat",
      image: "/testimonial-ramesh.jpg",
      rating: 5,
      relationship: "3 years",
      impact: "Receives daily meals"
    },
    {
      id: 2,
      quote: "I'm proud to support an organization that is so transparent and impactful. Seeing the smiling faces of the children they help is the greatest reward for any donor.",
      name: "Sunita Sharma",
      title: "Regular Donor",
      category: "Donor",
      location: "Mumbai, Maharashtra",
      image: "/testimonial-sunita.jpg",
      rating: 5,
      relationship: "2 years",
      impact: "₹5,000 monthly donor"
    },
    {
      id: 3,
      quote: "Volunteering with the foundation has been an incredibly fulfilling experience. The team's dedication and the systematic approach to helping people is inspiring.",
      name: "Amit Desai",
      title: "Software Engineer",
      category: "Volunteer",
      location: "Vadodara, Gujarat",
      image: "/testimonial-amit.jpg",
      rating: 5,
      relationship: "1 year",
      impact: "Weekend volunteer"
    },
    {
      id: 4,
      quote: "As a teacher, I've seen firsthand how their educational support program transforms children's lives. The notebooks and supplies make such a difference.",
      name: "Priya Mehta",
      title: "School Teacher",
      category: "Beneficiary",
      location: "Vadodara, Gujarat",
      image: "/testimonial-priya.jpg",
      rating: 5,
      relationship: "6 months",
      impact: "Students benefit from program"
    },
    {
      id: 5,
      quote: "The transparency in their operations convinced our company to partner with them for CSR activities. Every rupee donated is accounted for and creates real impact.",
      name: "Rajesh Kumar",
      title: "CSR Head, Tech Solutions Ltd",
      category: "Corporate Partner",
      location: "Ahmedabad, Gujarat",
      image: "/testimonial-rajesh.jpg",
      rating: 5,
      relationship: "8 months",
      impact: "₹2 lakhs contributed"
    },
    {
      id: 6,
      quote: "During the pandemic, when we lost our income, the foundation's food distribution kept our family going. We'll forever be grateful for their kindness.",
      name: "Meera Devi",
      title: "Mother of Three",
      category: "Beneficiary",
      location: "Vadodara, Gujarat",
      image: "/testimonial-meera.jpg",
      rating: 5,
      relationship: "2 years",
      impact: "Family of 5 supported"
    }
  ];

  const testimonials = customTestimonials || defaultTestimonials;

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
      }, 5000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(autoPlay), 3000); // Resume autoplay after 3s
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(autoPlay), 3000);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(autoPlay), 3000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.602-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'py-12 bg-gray-50',
          maxWidth: 'max-w-4xl',
          cardGrid: 'grid grid-cols-1 md:grid-cols-2 gap-8',
          card: 'bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300',
          quote: 'text-gray-600 text-sm italic mb-4',
          name: 'font-semibold text-gray-800',
          title: 'text-sm text-orange-500'
        };
      case 'carousel':
        return {
          container: 'py-16 bg-white',
          maxWidth: 'max-w-6xl',
          cardGrid: 'relative overflow-hidden',
          card: 'bg-gray-50 p-8 rounded-xl shadow-lg mx-4',
          quote: 'text-gray-700 text-lg italic mb-6',
          name: 'font-bold text-gray-800 text-lg',
          title: 'text-orange-600 font-medium'
        };
      case 'grid':
        return {
          container: 'py-16 bg-gray-50',
          maxWidth: 'max-w-7xl',
          cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
          card: 'bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1',
          quote: 'text-gray-600 italic mb-4',
          name: 'font-semibold text-gray-800',
          title: 'text-sm text-orange-500'
        };
      default:
        return {
          container: 'py-20 bg-orange-50',
          maxWidth: 'max-w-7xl',
          cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
          card: 'bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1',
          quote: 'text-gray-600 italic mb-6',
          name: 'font-bold text-gray-900 text-lg',
          title: 'text-sm text-orange-500 font-medium'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <section className={styles.container}>
      <div className={`${styles.maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {/* Category Filters for grid variant */}
          {variant === 'grid' && (
            <div className="flex justify-center space-x-4 mt-8">
              {['All', 'Community Member', 'Donor', 'Volunteer', 'Corporate Partner'].map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border border-gray-300 hover:border-orange-500 hover:text-orange-500"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Testimonials Display */}
        {variant === 'carousel' ? (
          // Carousel Layout
          <div className="relative">
            <div className="flex transition-transform duration-500 ease-in-out"
                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className={`${styles.card} max-w-4xl mx-auto`}>
                    <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start mb-4">
                          {renderStars(testimonial.rating)}
                        </div>
                        <blockquote className={styles.quote}>
                          {testimonial.quote}
                        </blockquote>
                        <div>
                          <div className={styles.name}>{testimonial.name}</div>
                          <div className={styles.title}>{testimonial.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {testimonial.category} • {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            {showNavigation && testimonials.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 text-gray-600 hover:text-orange-500"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300 text-gray-600 hover:text-orange-500"
                  aria-label="Next testimonial"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </>
            )}

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-orange-500 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Grid/List Layout
          <div className={styles.cardGrid}>
            {testimonials.slice(0, variant === 'compact' ? 4 : testimonials.length).map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`${styles.card} relative group`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Category Badge */}
                <div className="absolute -top-3 left-4">
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {testimonial.category}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex justify-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Quote */}
                <blockquote className={styles.quote}>
                  {testimonial.quote}
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center space-x-4 mt-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className={styles.name}>{testimonial.name}</div>
                    <div className={styles.title}>{testimonial.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testimonial.location} • {testimonial.relationship}
                    </div>
                  </div>
                </div>

                {/* Impact Badge */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-700 font-medium">Impact: {testimonial.impact}</div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-orange-500 bg-opacity-0 rounded-lg transition-all duration-300 pointer-events-none ${
                  hoveredIndex === index ? 'bg-opacity-5' : ''
                }`}></div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {variant === 'default' && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Want to Share Your Story?
              </h3>
              <p className="text-gray-600 mb-6">
                If our work has touched your life or your family&apos;s life, we&apos;d love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300">
                  Share Your Story
                </button>
                <button className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors duration-300">
                  Write a Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {variant === 'default' && (
          <div className="mt-12 bg-orange-500 text-white rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-90">Happy Beneficiaries</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-90">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">150+</div>
                <div className="text-sm opacity-90">Positive Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">5⭐</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;