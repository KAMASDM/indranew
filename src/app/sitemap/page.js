import Link from 'next/link';
export const metadata = { title: 'Sitemap | Indraprasth Foundation' };
export default function SitemapPage() {
  const pages = { '/': 'Home', '/about': 'About us', '/initiatives': 'Initiatives', '/events': 'Events', '/gallery': 'Photo gallery', '/search-face': 'Find my photo', '/blog': 'Blog & news', '/links': 'Social & media links', '/donate': 'Donate', '/volunteer': 'Volunteer', '/contact': 'Contact', '/admin': 'Admin' };
  return <main className="max-w-4xl mx-auto px-6 pt-32 pb-16"><h1 className="text-4xl font-bold mb-8">Sitemap</h1><ul className="space-y-4">{Object.entries(pages).map(([href, title]) => <li key={href}><Link className="text-teal-800 underline" href={href}>{title}</Link></li>)}</ul></main>;
}
