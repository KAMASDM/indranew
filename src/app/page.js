import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const initiatives = [
    { name: "Indraprasth nu Rasodu", description: "Providing over 200,000 free, nutritious meals to the needy.", icon: "/rasodu-icon.png" },
    { name: "Educational Support", description: "Distributing notebooks and supplies to underprivileged students.", icon: "/notebook-icon.png" },
    { name: "Blanket & Footwear Drive", description: "Offering warmth and comfort to homeless individuals during winters.", icon: "/blanket-icon.png" },
    { name: "Eco-friendly Ganesh Utsav", description: "Promoting environmental consciousness during festivals.", icon: "/ganesh-icon.png" },
];

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <main className="pt-20">
        <Hero />
        
        {/* Initiatives Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Key Initiatives</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">We are committed to a range of projects that address the core needs of our community.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {initiatives.map(item => (
                <div key={item.name} className="bg-white p-8 rounded-lg shadow-lg text-center">
                   <Image src={item.icon} alt={`${item.name} icon`} width={64} height={64} className="mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                   <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Testimonials />

        {/* CTA Section */}
        <section className="bg-orange-500 text-white">
            <div className="container mx-auto px-6 py-20 text-center">
                <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">Your support can help us expand our reach and touch more lives. Get involved today!</p>
                <Link href="/donate" className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                    Join Our Cause
                </Link>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
