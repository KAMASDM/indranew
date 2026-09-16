import { collection, doc, getDocs, query, where, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function subscribeToNewsletter(input, source) {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address');
  // Recognize legacy auto-ID subscribers too. Do not treat failed reads as absence.
  const legacy = await getDocs(query(collection(db, 'newsletterSubscribers'), where('email', '==', email)));
  if (!legacy.empty) return;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
  const id = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const reference = doc(db, 'newsletterSubscribers', id);
  await runTransaction(db, async transaction => {
    if ((await transaction.get(reference)).exists()) return;
    transaction.set(reference, { email, source, status: 'active', subscribedAt: serverTimestamp() });
  });
}
