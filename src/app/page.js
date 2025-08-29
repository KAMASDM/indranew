// Enhanced src/app/page.js - Updated Home Page
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import ImpactStats from '../components/ImpactStats';
import BackToTop from '../components/BackToTop';
import Image from 'next/image';
import Link from 'next/link';

const initiatives = [
  { 
    name: "Indraprasth nu Rasodu", 
    description: "Providing over 200,000 free, nutritious meals to the needy.", 
    icon: "/rasodu-icon.png",
    link: "/initiatives/indraprasth-nu-rasodu"
  },
  { 
    name: "Educational Support", 
    description: "Distributing notebooks and supplies to underprivileged students.", 
    icon: "/notebook-icon.png",
    link: "/initiatives/educational-support"
  },
  { 
    name: "Blanket & Footwear Drive", 
    description: "Offering warmth and comfort to homeless individuals during winters.", 
    icon: "/blanket-icon.png",
    link: "/initiatives/blanket-footwear-drive"
  },
  { 
    name: "Eco-friendly Ganesh Utsav", 
    description: "Promoting environmental consciousness during festivals.", 
    icon: "/ganesh-icon.png",
    link: "/initiatives/eco-friendly-ganesh-utsav"
  },
];

const features = [
  {
    title: "Transparent Operations",
    description: "Every donation is tracked and its impact is clearly documented for our donors.",
    icon: "👁️"
  },
  {
    title: "Community Driven",
    description: "Our programs are designed based on direct feedback from the communities we serve.",
    icon: "🤝"
  },
  {
    title: "Sustainable Impact",
    description: "We focus on long-term solutions that create lasting positive change.",
    icon: "🌱"
  },
  {
    title: "Local Expertise",
    description: "Deep understanding of Vadodara's needs through years of dedicated service.",
    icon: "🏠"
  }
];

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <main className="pt-20">
        <Hero />
        
        <ImpactStats />
        
        {/* Initiatives Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Key Initiatives</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
              We are committed to a range of projects that address the core needs of our community.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {initiatives.map(item => (
                <Link 
                  key={item.name} 
                  href={item.link}
                  className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transform hover:-translate-y-2 transition duration-300 group"
                >
                  <Image 
                    src={item.icon} 
                    alt={`${item.name} icon`} 
                    width={64} 
                    height={64} 
                    className="mx-auto mb-4 group-hover:scale-110 transition duration-300" 
                  />
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition duration-300">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <div className="mt-4 text-orange-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transition duration-300">
                    Learn More →
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-12">
              <Link 
                href="/initiatives" 
                className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition duration-300 font-semibold"
              >
                View All Initiatives
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose to Support Us?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We believe in transparency, community engagement, and creating sustainable impact.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-6 py-20 text-center relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Your support can help us expand our reach and touch more lives. Get involved today and be part of the change you want to see.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/donate" 
                className="bg-white text-orange-600 font-bold py-4 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Donate Now
              </Link>
              <Link 
                href="/volunteer" 
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-bold py-4 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Become a Volunteer
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
