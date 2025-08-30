"use client";
import { useEffect, useState } from "react";
import { marked } from "marked";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError("");
      try {
        // Try to fetch by slug field
        const q = query(collection(db, "news"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBlog({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          // fallback: try by id
          const docRef = doc(db, "news", slug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBlog({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError("Blog post not found.");
            setBlog(null);
          }
        }
      } catch (err) {
        setError("Failed to load blog post.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">{error || "Blog post not found."}</h1>
            <Link href="/blog" className="text-orange-500 underline">Back to Blog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          {blog.image && (
            <div className="relative h-64 w-full mb-8 rounded-xl overflow-hidden">
              <Image src={blog.image && typeof blog.image === 'string' && blog.image.startsWith('http') ? blog.image : '/default-blog.jpg'} alt={blog.title} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-4xl font-extrabold text-orange-700 mb-4">{blog.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            {blog.category && <span className="mr-2">#{blog.category}</span>}
            {blog.date && (
              <span>{new Date(blog.date.seconds ? blog.date.seconds * 1000 : blog.date).toLocaleDateString()}</span>
            )}
          </div>
          <p className="text-lg text-gray-700 mb-6">{blog.excerpt}</p>
          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: marked.parse(blog.content || "") }} />
          <Link href="/blog" className="inline-flex items-center border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            ← Back to Blog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
