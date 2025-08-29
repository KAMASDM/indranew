import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
             <Link href="/" className="flex items-center space-x-2">
                <Image src="/logo.png" alt="Indraprasth Foundation Logo" width={40} height={40} />
                <span className="text-lg font-bold">Indraprasth Foundation</span>
            </Link>
            <p className="text-gray-400">Serving humanity, spreading kindness in Vadodara since our inception.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="hover:text-orange-400">About Us</Link></li>
              <li><Link href="/events" className="hover:text-orange-400">Events</Link></li>
              <li><Link href="/gallery" className="hover:text-orange-400">Gallery</Link></li>
              <li><Link href="/donate" className="hover:text-orange-400">Donate</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>Indraprasth Foundation, Vadodara</li>
              <li>Email: contact@indraprasth.org</li>
              <li>Phone: +91 12345 67890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} Indraprasth Foundation. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
