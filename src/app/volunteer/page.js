'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const VolunteerPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, 'volunteerApplications'), {
                ...formData,
                submittedAt: serverTimestamp(),
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting application: ", error);
            alert("There was an error submitting your application. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-gray-50">
                <Navbar />
                <div className="pt-20 min-h-screen flex items-center justify-center text-center">
                    <div>
                        <h1 className="text-4xl font-bold text-green-600">Thank You!</h1>
                        <p className="mt-4 text-lg text-gray-700">Your application has been received. We will get in touch with you shortly.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <Navbar />
            <div className="pt-20">
                <header className="bg-orange-100 text-center py-20">
                    <h1 className="text-5xl font-bold text-gray-800">Become a Volunteer</h1>
                    <p className="text-xl mt-4 text-gray-600">Join our team and be a part of the change.</p>
                </header>
                <main className="container mx-auto px-6 py-16">
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                                <input type="text" name="name" id="name" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                                <input type="email" name="email" id="email" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                                <input type="tel" name="phone" id="phone" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Why do you want to volunteer?</label>
                                <textarea name="message" id="message" rows="4" onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition duration-300 disabled:bg-gray-400">
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VolunteerPage;