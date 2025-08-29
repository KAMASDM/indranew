import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AboutPage = () => {
  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="pt-20">
        <header className="bg-orange-500 text-white text-center py-20">
          <h1 className="text-5xl font-bold">About Indraprasth Foundation</h1>
          <p className="text-xl mt-4">Our Journey, Our Mission, Our Commitment</p>
        </header>

        <main className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded with a simple yet powerful vision, the Indraprasth Foundation is a charitable trust dedicated to uplifting the community of Vadodara. Our journey began with the 'Indraprasth nu Rasodu' initiative, providing free, nutritious meals to the needy.
              </p>
              <p className="text-gray-600">
                Under the guidance of Honorable Member of Parliament Mrs. Ranjanben Bhatt and the leadership of Shri Jayendra Shah, we have expanded our efforts to touch countless lives through various initiatives in education, health, and community welfare.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <Image src="/team-photo.jpg" alt="Indraprasth Foundation Team" width={600} height={400} className="object-cover" />
              {/*  */}
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision & Mission</h2>
            <p className="max-w-3xl mx-auto text-gray-600">
              Our vision is to create a self-reliant and equitable society. Our mission is to undertake initiatives that provide immediate relief and foster long-term empowerment for the underprivileged sections of our community. We believe in the power of collective action and compassion.
            </p>
          </div>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;