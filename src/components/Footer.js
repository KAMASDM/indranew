// Updated src/components/Footer.js with teal colors
import Link from 'next/link';
import Image from 'next/image';
import NewsletterSignup from './NewsletterSignup';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Foundation Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <Image 
                src="/logo.png" 
                alt="Indraprasth Foundation Logo" 
                width={50} 
                height={50} 
                className="group-hover:scale-110 transition duration-300"
              />
              <div>
                <span className="text-xl font-bold">Indraprasth Foundation</span>
                <p className="text-sm text-gray-400">Serving Humanity</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Dedicated to uplifting the community of Vadodara through various initiatives 
              in education, health, and community welfare since our inception.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon="facebook" />
              <SocialLink href="#" icon="twitter" />
              <SocialLink href="#" icon="instagram" />
              <SocialLink href="#" icon="linkedin" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-teal-400">Quick Links</h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/initiatives">Our Initiatives</FooterLink>
              <FooterLink href="/events">Events</FooterLink>
              <FooterLink href="/gallery">Photo Gallery</FooterLink>
              <FooterLink href="/volunteer">Become a Volunteer</FooterLink>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-teal-400">Get Involved</h3>
            <ul className="space-y-3">
              <FooterLink href="/donate">Make a Donation</FooterLink>
              <FooterLink href="/volunteer">Join as Volunteer</FooterLink>
              <FooterLink href="/contact">Partner with Us</FooterLink>
              <FooterLink href="/contact">Corporate CSR</FooterLink>
              <FooterLink href="/admin">Admin Portal</FooterLink>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-teal-400">Stay Connected</h3>
            <div className="space-y-4 mb-6">
              <ContactItem icon="location" text="Vadodara, Gujarat, India" />
              <ContactItem icon="email" text="contact@indraprasth.org" />
              <ContactItem icon="phone" text="+91 12345 67890" />
            </div>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              &copy; {currentYear} Indraprasth Foundation. All rights reserved.
            </div>
            <div className="flex flex-wrap space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-teal-400 transition duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-teal-400 transition duration-200">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-teal-400 transition duration-200">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Helper Components
const FooterLink = ({ href, children }) => (
  <li>
    <Link 
      href={href} 
      className="text-gray-400 hover:text-teal-400 transition duration-200 text-sm flex items-center group"
    >
      <span className="group-hover:translate-x-1 transition duration-200">{children}</span>
    </Link>
  </li>
);

const ContactItem = ({ icon, text }) => {
  const iconMap = {
    location: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    ),
    email: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    ),
    phone: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
      </svg>
    )
  };

  return (
    <div className="flex items-center space-x-3 text-sm text-gray-400">
      <div className="text-teal-400">{iconMap[icon]}</div>
      <span>{text}</span>
    </div>
  );
};

const SocialLink = ({ href, icon }) => {
  const iconMap = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.324-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.324C5.901 8.247 7.152 7.757 8.449 7.757s2.448.49 3.324 1.297c.806.876 1.297 2.027 1.297 3.324s-.49 2.448-1.297 3.324C10.897 16.498 9.746 16.988 8.449 16.988z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  };

  return (
    <a 
      href={href} 
      className="bg-gray-800 p-2 rounded-full hover:bg-teal-500 transition duration-300 transform hover:scale-110"
      target="_blank"
      rel="noopener noreferrer"
    >
      {iconMap[icon]}
    </a>
  );
};

export default Footer;