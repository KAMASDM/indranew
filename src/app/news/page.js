"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-orange-700 mb-6">News & Updates</h1>
          <p className="text-lg text-gray-700 mb-10">Latest news, press releases, and updates from our organization.</p>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No news yet</h2>
            <p className="text-gray-500 mb-4">Stay tuned for the latest updates and announcements.</p>
            <Link href="/admin" className="text-orange-500 underline">Go to Admin</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
