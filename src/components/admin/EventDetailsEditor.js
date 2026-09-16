'use client';
import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dateInput } from '@/lib/data.mjs';

export default function EventDetailsEditor({ event, onSaved }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.startDate || !form.endDate || form.endDate < form.startDate) {
      setError('Enter a name, description, and valid start and end dates.'); return;
    }
    setSaving(true); setError('');
    try {
      await updateDoc(doc(db, 'events', event.id), { ...form, name: form.name.trim(), description: form.description.trim(), updatedAt: new Date().toISOString() });
      setOpen(false); onSaved?.();
    } catch { setError('Could not save event. Please retry.'); }
    finally { setSaving(false); }
  };
  if (!open) return <button className="text-blue-700 underline my-3" onClick={() => { setForm({ name: event.name || '', description: event.description || '', startDate: dateInput(event.startDate), endDate: dateInput(event.endDate || event.startDate), mapUrl: event.mapUrl || '' }); setError(''); setOpen(true); }}>Edit event details</button>;
  return <form onSubmit={submit} className="p-4 bg-blue-50 rounded-xl space-y-3 my-3">
    {Object.entries({ name: 'Event name', startDate: 'Start date', endDate: 'End date', mapUrl: 'Map URL', description: 'Description' }).map(([key, label]) => <label key={key} className="block text-gray-900">{label}
      {key === 'description' ? <textarea required value={form[key]} onChange={e => setForm(previous => ({ ...previous, [key]: e.target.value }))} className="w-full bg-white border p-2 rounded" /> : <input required={key !== 'mapUrl'} type={key.endsWith('Date') ? 'date' : key === 'mapUrl' ? 'url' : 'text'} value={form[key]} onChange={e => setForm(previous => ({ ...previous, [key]: e.target.value }))} className="w-full bg-white border p-2 rounded" />}
    </label>)}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded">{saving ? 'Saving…' : 'Save event'}</button>
    <button type="button" disabled={saving} onClick={() => setOpen(false)} className="ml-4 text-gray-800">Cancel</button>
  </form>;
}
