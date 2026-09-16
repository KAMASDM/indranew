'use client';
import { useRef, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { donationAmount } from '@/lib/data.mjs';

export default function DonationPayment({ amount, cause, frequency }) {
  const [form, setForm] = useState({ name: '', email: '', reference: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const submissionId = useRef(null);
  const submitting = useRef(false);
  const submit = async event => {
    event.preventDefault();
    if (submitting.current || status === 'saved') return;
    const validAmount = donationAmount(amount);
    if (!validAmount) { setError('Enter a donation amount of at least ₹1, with up to two decimal places.'); return; }
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !/^[a-zA-Z0-9-]{6,50}$/.test(form.reference.trim())) {
      setError('Enter your name, email, and the transaction reference from your UPI app.'); return;
    }
    submitting.current = true;
    setStatus('saving');
    setError('');
    try {
      submissionId.current ||= crypto.randomUUID();
      await setDoc(doc(db, 'donations', submissionId.current), {
        name: form.name.trim(), email: form.email.trim().toLowerCase(), reference: form.reference.trim(),
        amount: validAmount, cause, frequency, status: 'pending', submittedAt: serverTimestamp()
      });
      setStatus('saved');
    } catch {
      setStatus('idle');
      setError('Your details could not be saved. Please retry or email contact@indraprasthfoundation.org with your payment reference.');
    } finally { submitting.current = false; }
  };
  if (status === 'saved') return <div role="status" className="p-6 rounded-xl bg-green-50 text-green-900">
    <h3 className="font-bold text-lg">Payment details submitted</h3>
    <p>The foundation will check your payment reference. This submission is pending verification and is not a payment receipt.</p>
    <p className="mt-2 text-sm break-all">Submission ID: {submissionId.current}</p>
  </div>;
  return <form onSubmit={submit} className="space-y-4 mt-6 text-left">
    <h3 className="font-bold text-gray-900">Already paid? Share your payment reference</h3>
    <p className="text-sm text-gray-600">Enter ₹{amount} in your UPI app when paying. The QR code does not set the amount automatically. {frequency === 'monthly' && 'Monthly support requires a separate payment each month; no automatic debit is set up.'}</p>
    {Object.entries({ name: 'Your name', email: 'Email address', reference: 'UPI transaction reference' }).map(([key, label]) => <label key={key} className="block text-gray-800">{label}
      <input required type={key === 'email' ? 'email' : 'text'} value={form[key]} disabled={status === 'saving'} maxLength={key === 'reference' ? 50 : 200}
        onChange={e => setForm(previous => ({ ...previous, [key]: e.target.value }))} className="block w-full border rounded-lg p-3 bg-white text-gray-900" />
    </label>)}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button disabled={status === 'saving'} className="bg-green-600 text-white rounded-lg px-6 py-3 font-semibold disabled:opacity-50">{status === 'saving' ? 'Submitting…' : 'Submit payment details'}</button>
  </form>;
}
