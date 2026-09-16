import { deleteObject, ref } from 'firebase/storage';
import { storage } from './firebase';
import { imageUrls } from './data.mjs';

export async function deleteImages(images) {
  const results = await Promise.allSettled(imageUrls(images).filter(url => /^(gs:\/\/|https:\/\/(firebasestorage|storage)\.googleapis\.com\/)/.test(url) || (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && /^http:\/\/127\.0\.0\.1:9299\//.test(url))).map(async url => {
    try {
      await deleteObject(ref(storage, url));
    } catch (error) {
      if (error.code !== 'storage/object-not-found') throw error;
    }
  }));
  const failed = results.filter(result => result.status === 'rejected');
  if (failed.length) throw new Error(`${failed.length} image(s) could not be removed from storage. Please retry.`);
}
