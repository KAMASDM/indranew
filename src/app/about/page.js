// Enhanced src/app/about/page.js
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ImpactStats from '../../components/ImpactStats';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [loading, setLoading] = useState(true);
  const [visibleSection, setVisibleSection] = useState('');

  useEffect(() => {
    // Simulate loading time for images and content
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'story', 'mission', 'team', 'timeline'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setVisibleSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teamMembers = [
    {
      name: 'Honorable Mrs. Ranjanben Bhatt',
      role: 'Patron & Member of Parliament',
      description: 'Providing guidance and support to our foundation\'s mission and vision.',
      image: '/team-ranjanben.jpg',
      achievements: ['Member of Parliament', 'Community Leader', 'Social Reformer']
    },
    {
      name: 'Shri Jayendra Shah',
      role: 'Founder & Chairman',
      description: 'Visionary leader who started the foundation with a dream to serve humanity.',
      image: '/team-jayendra.jpg',
      achievements: ['Founder of Foundation', 'Community Service Award', '5+ Years Leadership']
    },
    {
      name: 'Mrs. Priya Patel',
      role: 'Program Director',
      description: 'Overseeing all our community programs and ensuring quality service delivery.',
      image: '/team-priya.jpg',
      achievements: ['Program Management', 'Community Outreach', 'Volunteer Coordination']
    },
    {
      name: 'Mr. Amit Sharma',
      role: 'Operations Manager',
      description: 'Managing day-to-day operations and logistics for all our initiatives.',
      image: '/team-amit.jpg',
      achievements: ['Operations Excellence', 'Logistics Management', 'Process Optimization']
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Foundation Established',
      description: 'Indraprasth Foundation was officially registered as a charitable trust with the vision to serve humanity.',
      icon: '🏛️',
      color: 'from-blue-400 to-blue-600'
    },
    {
      year: '2021',
      title: 'Indraprasth nu Rasodu Launched',
      description: 'Started our flagship food distribution program, serving free meals to those in need.',
      icon: '🍽️',
      color: 'from-green-400 to-green-600'
    },
    {
      year: '2022',
      title: 'Educational Support Program',
      description: 'Expanded our services to include educational support for underprivileged children.',
      icon: '📚',
      color: 'from-purple-400 to-purple-600'
    },
    {
      year: '2023',
      title: '100,000 Meals Milestone',
      description: 'Reached the significant milestone of serving over 100,000 free meals to the community.',
      icon: '🎯',
      color: 'from-orange-400 to-orange-600'
    },
    {
      year: '2024',
      title: 'Community Programs Expansion',
      description: 'Added blanket drives, footwear distribution, and eco-friendly festival celebrations.',
      icon: '🌟',
      color: 'from-teal-400 to-teal-600'
    },
    {
      year: '2025',
      title: '200,000+ Meals & Growing',
      description: 'Continuing to expand our reach and impact with over 200,000 meals served and growing.',
      icon: '🚀',
      color: 'from-red-400 to-red-600'
    }
  ];

  const values = [
    {
      title: 'Compassion',
      description: 'We approach every individual with empathy, understanding, and genuine care.',
      icon: '❤️',
      color: 'from-red-400 to-pink-500'
    },
    {
      title: 'Transparency',
      description: 'We maintain complete openness in our operations and financial management.',
      icon: '🔍',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Dignity',
      description: 'We ensure that every person we serve is treated with respect and dignity.',
      icon: '🤝',
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in every program and service we provide.',
      icon: '⭐',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      title: 'Community',
      description: 'We believe in the power of community and collective action for change.',
      icon: '🏘️',
      color: 'from-purple-400 to-violet-500'
    },
    {
      title: 'Sustainability',
      description: 'We focus on creating long-term, sustainable solutions for community needs.',
      icon: '🌱',
      color: 'from-teal-400 to-cyan-500'
    }
  ];

  const achievements = [
    { number: '200,000+', label: 'Meals Served', icon: '🍽️' },
    { number: '5,000+', label: 'Families Helped', icon: '👨‍👩‍👧‍👦' },
    { number: '150+', label: 'Active Volunteers', icon: '🤝' },
    { number: '12', label: 'Community Programs', icon: '🎯' },
    { number: '5', label: 'Years of Service', icon: '📅' },
    { number: '25+', label: 'Partner Organizations', icon: '🤝' }
  ];

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner size="xl" />
            <p className="text-gray-500 mt-4">Loading our story...</p>
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
        <section id="hero" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  About Indraprasth Foundation
                </h1>
                <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                  Our Journey, Our Mission, Our Commitment to Serving Humanity with Compassion
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => document.getElementById('story').scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Discover Our Story
                  </button>
                  <button
                    onClick={() => document.getElementById('mission').scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Our Mission
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Quick Facts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.slice(0, 4).map((achievement, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <div className="text-2xl font-bold mb-1">{achievement.number}</div>
                        <div className="text-sm opacity-90">{achievement.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-white shadow-sm sticky top-20 z-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-center space-x-8 py-4 overflow-x-auto">
              {[
                { id: 'story', label: 'Our Story', icon: '📖' },
                { id: 'mission', label: 'Mission & Vision', icon: '🎯' },
                { id: 'team', label: 'Our Team', icon: '👥' },
                { id: 'timeline', label: 'Timeline', icon: '📅' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    document.getElementById(tab.id).scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                    visibleSection === tab.id || activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="container mx-auto px-6 py-16">
          {/* Our Story Section */}
          <section id="story" className="mb-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    Founded with a simple yet powerful vision, the Indraprasth Foundation is a charitable trust 
                    dedicated to uplifting the community of Vadodara. Our journey began with the 
                    <span className="font-semibold text-orange-600">&apos;Indraprasth nu Rasodu&apos;</span> 
                    initiative, providing free, nutritious meals to the needy.
                  </p>
                  <p>
                    Under the guidance of <span className="font-semibold">Honorable Member of Parliament Mrs. Ranjanben Bhatt</span> 
                    and the leadership of <span className="font-semibold">Shri Jayendra Shah</span>, we have expanded our efforts 
                    to touch countless lives through various initiatives in education, health, and community welfare.
                  </p>
                  <p>
                    What started as a small initiative to feed the hungry has grown into a comprehensive 
                    community service organization that addresses multiple facets of social need. We believe 
                    that every person deserves dignity, respect, and the opportunity to thrive.
                  </p>
                </div>
                
                {/* Story Highlights */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">2020</div>
                    <div className="text-sm text-gray-600">Foundation Started</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">200K+</div>
                    <div className="text-sm text-gray-600">Lives Touched</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Service Commitment</div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Image 
                    src="/about-story.jpg" 
                    alt="Indraprasth Foundation Story" 
                    width={600} 
                    height={400} 
                    className="object-cover w-full h-96" 
                  />
                </div>
                {/* Floating stat cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">5+</div>
                  <div className="text-sm text-gray-600">Years Serving</div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4">
                  <div className="text-2xl font-bold text-green-600">150+</div>
                  <div className="text-sm text-gray-600">Volunteers</div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section id="mission" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Vision & Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Guided by our core values and driven by compassion, we work towards creating 
                a self-reliant and equitable society for all.
              </p>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">👁️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To create a self-reliant and equitable society where every individual has access to 
                  basic necessities, education, and opportunities for growth, regardless of their 
                  socio-economic background.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To undertake initiatives that provide immediate relief and foster long-term empowerment 
                  for the underprivileged sections of our community. We believe in the power of collective 
                  action and compassion.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div>
              <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Core Values</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="group text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {value.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section id="team" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Dedicated individuals who work tirelessly to make our mission a reality
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative overflow-hidden">
                    <div className="w-full h-64 bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center">
                      <span className="text-6xl text-white">👤</span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h4>
                    <p className="text-orange-600 font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.description}</p>
                    <div className="space-y-1">
                      {member.achievements.map((achievement, achIndex) => (
                        <div key={achIndex} className="flex items-center text-xs text-gray-500">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          <section id="timeline" className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Journey Timeline</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Key milestones in our mission to serve the community
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300 hidden lg:block"></div>
              
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} flex-col lg:justify-between`}>
                    <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} text-center mb-6 lg:mb-0`}>
                      <div className={`bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 ${index % 2 === 0 ? 'lg:ml-8' : 'lg:mr-8'}`}>
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-3xl mb-4 ${index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'} mx-auto lg:mx-0`}>
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="relative z-10 w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg hidden lg:block"></div>
                    
                    {/* Year */}
                    <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:text-left' : 'lg:text-right'} text-center`}>
                      <div className={`${index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'}`}>
                        <div className="text-4xl font-bold text-orange-500 mb-2">{item.year}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Impact Stats */}
        <ImpactStats variant="cards" />

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Join Our Mission?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Whether through volunteering, donating, or spreading awareness, 
              every contribution helps us create a better tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/volunteer"
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
              >
                <span className="mr-2">🤝</span>
                Become a Volunteer
              </Link>
              <Link
                href="/donate"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
              >
                <span className="mr-2">💝</span>
                Make a Donation
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;