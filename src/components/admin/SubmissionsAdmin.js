'use client';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate, toDate } from '@/lib/data.mjs';

export default function SubmissionsAdmin({ kind }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const snapshot = await getDocs(collection(db, kind));
      setItems(snapshot.docs.map(item => ({ ...item.data(), id: item.id })).sort((a, b) => (toDate(b.submittedAt || b.createdAt)?.getTime() || 0) - (toDate(a.submittedAt || a.createdAt)?.getTime() || 0)));
    } catch { setError('Unable to load submissions. Please retry.'); }
    finally { setLoading(false); }
  }, [kind]);
  useEffect(() => { load(); }, [load]);
  const act = async (item, action) => {
    if (!window.confirm(action === 'verified' ? 'Have you verified this payment against the foundation’s payment records?' : 'Delete this submission?')) return;
    setBusy(item.id); setError('');
    try {
      if (action === 'delete') await deleteDoc(doc(db, kind, item.id));
      else await updateDoc(doc(db, kind, item.id), { status: action, reviewedAt: serverTimestamp() });
      await load();
    } catch { setError('The submission could not be updated. Please retry.'); }
    finally { setBusy(null); }
  };
  return <section className="bg-white rounded-xl p-6 space-y-5 text-gray-900">
    <div className="flex justify-between"><h2 className="text-2xl font-bold">{kind === 'donations' ? 'Donation references' : 'Submitted stories'}</h2><button onClick={load} disabled={loading} className="text-blue-700">Refresh</button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p>Loading submissions…</p> : !items.length && <p>No submissions yet.</p>}
    {items.map(item => <article key={item.id} className="border rounded-lg p-4 space-y-3">
      <h3 className="font-bold">{item.name}</h3><a className="text-blue-700" href={`mailto:${item.email}`}>{item.email}</a>
      <p className="text-sm text-gray-600">{formatDate(item.submittedAt || item.createdAt)}</p>
      {kind === 'donations' ? <><p>₹{item.amount} · {item.cause} · {item.frequency}</p><p className="break-all">Reference: {item.reference}</p><p>Status: {item.status || 'pending'}</p>
        {item.status !== 'verified' && <button disabled={!!busy} onClick={() => act(item, 'verified')} className="bg-green-700 text-white px-4 py-2 rounded mr-3">Mark verified</button>}
      </> : <p className="whitespace-pre-wrap">{item.story}</p>}
      <button disabled={!!busy} onClick={() => act(item, 'delete')} className="text-red-700">Delete</button>
    </article>)}
  </section>;
}
