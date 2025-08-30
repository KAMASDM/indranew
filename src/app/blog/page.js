"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Image from "next/image";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError("");
      try {
        const q = query(collection(db, "news"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        setBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-orange-700 mb-6 text-center">Our Blog</h1>
          <p className="text-lg text-gray-700 mb-10 text-center">Insights, stories, and updates from our journey of impact and service.</p>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading blog posts...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-16">{error}</div>
          ) : blogs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No blog posts yet</h2>
              <p className="text-gray-500 mb-4">Stay tuned for updates and inspiring stories from our initiatives.</p>
              <Link href="/admin" className="text-orange-500 underline">Go to Admin</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {blogs.map(blog => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug || blog.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden">
                    <Image 
                      src={blog.image && typeof blog.image === 'string' && blog.image.startsWith('http') ? blog.image : '/default-blog.jpg'}
                      alt={blog.title}
                      fill
                      className="object-cover" 
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-orange-700 mb-2 group-hover:text-orange-800 transition-colors">{blog.title}</h2>
                  <div className="text-sm text-gray-500 mb-2">
                    {blog.category && <span className="mr-2">#{blog.category}</span>}
                    {blog.date && (
                      <span>{new Date(blog.date.seconds ? blog.date.seconds * 1000 : blog.date).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-3">{blog.excerpt || (blog.content && blog.content.slice(0, 120) + "...")}</p>
                  <span className="text-orange-500 font-semibold mt-auto">Read More →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
