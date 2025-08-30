// BlogManager.js - Admin blog/news management component
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false });
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const initialForm = { title: '', slug: '', excerpt: '', content: '', image: '', category: '', date: '', metaTitle: '', metaDescription: '' };

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'news'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleContentChange = value => {
    setForm({ ...form, content: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!form.title || !form.slug || !form.content) {
        setError('Title, slug, and content are required.');
        setLoading(false);
        return;
      }
      if (editingId) {
        await updateDoc(doc(db, 'news', editingId), { ...form, date: new Date(form.date) || serverTimestamp() });
      } else {
        await addDoc(collection(db, 'news'), { ...form, date: new Date(form.date) || serverTimestamp() });
      }
      setForm(initialForm);
      setEditingId(null);
      fetchBlogs();
    } catch (err) {
      setError('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = blog => {
    setForm({ ...blog, date: blog.date ? new Date(blog.date).toISOString().slice(0,10) : '' });
    setEditingId(blog.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this blog post?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'news', id));
      fetchBlogs();
    } catch {
      setError('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Blog/News Manager</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-2 rounded text-gray-900 bg-white" required />
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="Slug (unique, SEO-friendly)" className="border p-2 rounded text-gray-900 bg-white" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border p-2 rounded text-gray-900 bg-white" />
          <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="border p-2 rounded text-gray-900 bg-white" />
          <input name="date" value={form.date} onChange={handleChange} type="date" className="border p-2 rounded text-gray-900 bg-white" />
        </div>
        <input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="Meta Title (SEO)" className="border p-2 rounded text-gray-900 bg-white w-full" />
        <input name="metaDescription" value={form.metaDescription} onChange={handleChange} placeholder="Meta Description (SEO)" className="border p-2 rounded text-gray-900 bg-white w-full" />
        <input name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Excerpt (for previews)" className="border p-2 rounded text-gray-900 bg-white w-full" />
        <div>
          <label className="block font-semibold mb-1">Content</label>
          <MarkdownEditor value={form.content} onChange={handleContentChange} />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded font-bold" disabled={loading}>{editingId ? 'Update' : 'Create'} Blog</button>
        {editingId && <button type="button" className="ml-4 text-gray-500 underline" onClick={()=>{setForm(initialForm);setEditingId(null);}}>Cancel Edit</button>}
      </form>
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="font-semibold">Filter by Category:</label>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="border rounded p-1 text-gray-900 bg-white">
          <option value="">All</option>
          {[...new Set(blogs.map(b=>b.category).filter(Boolean))].map(cat=>(<option key={cat} value={cat}>{cat}</option>))}
        </select>
      </div>
      <h3 className="text-xl font-semibold mb-2">All Blog Posts</h3>
      {loading ? <div>Loading...</div> : (
        <ul className="divide-y">
          {blogs.filter(b=>!categoryFilter||b.category===categoryFilter).map(blog => (
            <li key={blog.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-bold">{blog.title}</span> <span className="text-gray-400">/ {blog.slug}</span>
                <div className="text-xs text-gray-500">{blog.category} | {blog.date && new Date(blog.date).toLocaleDateString()}</div>
              </div>
              <div className="mt-2 md:mt-0 flex gap-2">
                <button className="text-teal-600 underline" onClick={()=>handleEdit(blog)}>Edit</button>
                <button className="text-red-500 underline" onClick={()=>handleDelete(blog.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
