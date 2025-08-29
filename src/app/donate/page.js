import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DonatePage = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <div className="pt-20">
         <div className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 items-center">
            <div>
                <h1 className="text-5xl font-extrabold text-gray-800 leading-tight">Your Contribution Can Change a Life Today</h1>
                <p className="mt-6 text-lg text-gray-600">Every donation, no matter how small, helps us provide essential services like meals, education, and shelter to those who need it most in Vadodara. Join us in making a lasting impact.</p>
                <div className="mt-8">
                    {/* Replace with your actual donation QR code */}
                    <Image src="/donate-qr.jpeg" alt="Donation QR Code" width={250} height={250} className="rounded-lg shadow-lg"/>
                    <p className="mt-4 text-sm text-gray-500">Scan the QR code to donate securely.</p>
                </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <Image src="/donation-impact.jpg" alt="Child receiving a meal" width={600} height={450} className="object-cover" />
              {/*  */}
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonatePage;
