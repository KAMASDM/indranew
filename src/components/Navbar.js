'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-20 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Indraprasth Foundation Logo" width={50} height={50} />
              <span className="text-xl font-bold text-gray-800">Indraprasth Foundation</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium">About Us</Link>
              <Link href="/events" className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium">Events</Link>
              <Link href="/gallery" className="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium">Gallery</Link>
              <Link href="/donate" className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-full text-base font-medium shadow-md transition duration-300">Donate</Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} type="button" className="bg-orange-500 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-500 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-gray-600 hover:bg-orange-100 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
            <Link href="/about" className="text-gray-600 hover:bg-orange-100 block px-3 py-2 rounded-md text-base font-medium">About Us</Link>
            <Link href="/events" className="text-gray-600 hover:bg-orange-100 block px-3 py-2 rounded-md text-base font-medium">Events</Link>
            <Link href="/gallery" className="text-gray-600 hover:bg-orange-100 block px-3 py-2 rounded-md text-base font-medium">Gallery</Link>
            <Link href="/donate" className="bg-orange-500 text-white hover:bg-orange-600 block px-3 py-2 rounded-md text-base font-medium">Donate</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;