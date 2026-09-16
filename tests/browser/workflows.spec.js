import { test, expect } from '@playwright/test';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL, getMetadata } from 'firebase/storage';

const app = initializeApp({ projectId: 'demo-indra', apiKey: 'demo-api-key', storageBucket: 'demo-indra.appspot.com' }, 'test-fixtures');
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8180);
const storage = getStorage(app);
connectStorageEmulator(storage, '127.0.0.1', 9299);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const seed = (name, id, data) => setDoc(doc(db, name, id), data);
const read = async (name, id) => (await getDoc(doc(db, name, id))).data();
async function admin(page, tab) {
  await page.goto('/admin');
  await page.getByRole('button', { name: tab }).first().click();
}
test.beforeEach(async ({ request, page }) => {
  const result = await request.delete('http://127.0.0.1:8180/emulator/v1/projects/demo-indra/databases/(default)/documents');
  expect(result.ok()).toBeTruthy();
  page.on('dialog', dialog => dialog.accept());
});

test('single site navigation, open admin, and working footer destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Share Your Story', exact: true })).toBeVisible();
  const links = await page.locator('footer a[href^="/"]').evaluateAll(items => items.map(item => item.getAttribute('href')));
  for (const href of new Set(links)) expect((await page.request.get(href)).status()).toBe(200);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
  await expect(page.locator('nav')).toHaveCount(1);
});

test('About admin changes appear on the public page', async ({ page }) => {
  await admin(page, 'Hero & About');
  await page.getByPlaceholder('Enter about page title').fill('Our updated foundation');
  await page.getByPlaceholder('Enter your mission statement').fill('A mission saved by the admin.');
  await page.getByPlaceholder('Enter your vision statement').fill('A vision saved by the admin.');
  await page.getByPlaceholder('Enter detailed description about your organization').fill('Our edited story appears here.');
  await page.getByRole('button', { name: 'Add Value', exact: true }).click();
  await page.getByPlaceholder('Core value 1').fill('Community care');
  await page.getByRole('button', { name: /Update About Content/ }).click();
  await expect.poll(async () => (await read('content', 'about'))?.title).toBe('Our updated foundation');
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'Our updated foundation' })).toBeVisible();
  await expect(page.getByText('Our edited story appears here.')).toBeVisible();
  await expect(page.getByText('A mission saved by the admin.')).toBeVisible();
  await expect(page.getByText('Community care', { exact: true })).toBeVisible();
});

test('gallery caption and category edits persist; public pagination loads more photos', async ({ page }) => {
  await Promise.all(Array.from({ length: 25 }, (_, i) => seed('gallery', `photo-${i}`, { url: '/image-placeholder.svg', caption: `Photo ${i}`, uploadedAt: new Date(2026, 0, i + 1).toISOString(), ...(i % 2 ? { category: 'education' } : {}) })));
  await admin(page, 'Media');
  await page.getByTitle('Edit caption').first().click({ force: true });
  await page.getByPlaceholder('Enter new caption...').fill('Edited gallery caption');
  await page.getByLabel('Category', { exact: true }).last().fill('community');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(async () => (await read('gallery', 'photo-24'))?.caption).toBe('Edited gallery caption');
  await page.goto('/gallery');
  await expect(page.getByAltText('Edited gallery caption')).toBeVisible();
  await page.getByRole('button', { name: /Load more photos|Loading more/ }).scrollIntoViewIfNeeded();
  await expect(page.getByAltText('Photo 5', { exact: true })).toBeAttached();
  await page.getByRole('button', { name: /General/ }).click();
  await expect(page.getByAltText('Photo 22', { exact: true })).toBeVisible();
});

test('blog creation, preview, timestamp editing and legacy news redirects work', async ({ page }) => {
  await admin(page, 'Blog & News');
  await page.getByPlaceholder('Title', { exact: true }).fill('Community update');
  await page.getByPlaceholder('Write your blog content in Markdown...').fill('## A real update\n\n**Thank you** <img src="x" onerror="window.badContent=true">');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A real update' })).toBeVisible();
  await expect(page.locator('[onerror]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Create Blog' }).click();
  const post = page.locator('li').filter({ hasText: 'Community update' });
  await expect(post).toBeVisible();
  await post.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.locator('input[type="date"]')).not.toHaveValue('');
  await page.getByPlaceholder('Title', { exact: true }).fill('Edited community update');
  await page.getByRole('button', { name: 'Update Blog' }).click();
  await expect(page.getByText('Edited community update', { exact: true })).toBeVisible();
  await page.goto('/news/community-update');
  await expect(page).toHaveURL(/\/blog\/community-update$/);
  await expect(page.getByRole('heading', { name: 'Edited community update' })).toBeVisible();
  expect(await page.evaluate(() => window.badContent)).toBeUndefined();
});

test('contact submissions retain timestamps and long messages can be expanded', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('[name="name"]').fill('Test Supporter');
  await page.locator('[name="email"]').fill('supporter@example.com');
  await page.locator('[name="subject"]').fill('Community inquiry');
  const message = 'I would like to help the community and learn about your upcoming programs. '.repeat(3);
  await page.locator('[name="message"]').fill(message);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect.poll(async () => (await getDocs(collection(db, 'contactMessages'))).size).toBe(1);
  await admin(page, 'Messages');
  await expect(page.getByText('Invalid Date')).toHaveCount(0);
  await page.getByRole('button', { name: 'Read more' }).click();
  await expect(page.getByRole('button', { name: 'Show less' })).toBeVisible();
  await expect(page.locator('.whitespace-pre-wrap').filter({ hasText: message.trim() })).toBeVisible();
});

test('volunteer admin displays the actual application fields', async ({ page }) => {
  await seed('volunteerApplications', 'volunteer', { name: 'New Volunteer', email: 'volunteer@example.com', phone: '9876543210', submittedAt: Timestamp.now(), motivation: 'I want to support local students.', skills: 'teaching, it', availability: 'weekends', emergencyContact: 'Family 9876543211', status: 'pending' });
  await admin(page, 'Volunteers');
  await expect(page.getByText('I want to support local students.')).toBeVisible();
  await expect(page.getByText('teaching, it')).toBeVisible();
  await expect(page.getByText('Family 9876543211')).toBeVisible();
  await expect(page.getByText('Invalid Date')).toHaveCount(0);
});

test('donation amount validation and pending reference submission', async ({ page }) => {
  await page.goto('/donate');
  await page.getByLabel('Custom amount').fill('0');
  await page.getByRole('button', { name: 'Continue to Cause Selection' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('Enter an amount');
  await page.getByLabel('Custom amount').fill('250.50');
  await page.getByRole('button', { name: 'Payment', exact: false }).first().click();
  await expect(page.getByText('Amount: ₹250.5')).toBeVisible();
  await page.getByLabel('Your name').fill('Test Donor');
  await page.getByLabel('Email address', { exact: true }).fill('donor@example.com');
  await page.getByLabel('UPI transaction reference').fill('123456789012');
  await page.getByRole('button', { name: 'Submit payment details' }).click();
  await expect(page.getByRole('heading', { name: 'Payment details submitted' })).toBeVisible();
  const snapshot = await getDocs(collection(db, 'donations'));
  expect(snapshot.size).toBe(1);
  expect(snapshot.docs[0].data()).toMatchObject({ amount: 250.5, status: 'pending', reference: '123456789012' });
  await admin(page, 'Donations');
  await page.getByRole('button', { name: 'Mark verified' }).click();
  await expect(page.getByText('Status: verified')).toBeVisible();
});

test('removing initiative images can be cancelled; deleting removes all storage objects', async ({ page }) => {
  const paths = ['initiatives/test/a.png', 'initiatives/test/b.png'];
  const urls = await Promise.all(paths.map(async path => { const image = ref(storage, path); await uploadBytes(image, png, { contentType: 'image/png' }); return getDownloadURL(image); }));
  await seed('initiatives', 'test', { title: 'Image cleanup initiative', slug: 'image-cleanup', description: 'Test initiative', category: 'education', imageUrl: urls, gallery: [], impact: {}, createdAt: Timestamp.now() });
  await admin(page, 'Initiatives');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByTitle('Delete main image').first().click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await read('initiatives', 'test')).imageUrl).toHaveLength(2);
  for (const path of paths) expect((await getMetadata(ref(storage, path))).size).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect.poll(() => read('initiatives', 'test')).toBeUndefined();
  for (const path of paths) await expect(getMetadata(ref(storage, path))).rejects.toMatchObject({ code: 'storage/object-not-found' });
});

test('newsletter signup deduplicates and dates export correctly', async ({ page }) => {
  for (let i = 0; i < 2; i++) {
    await page.goto('/contact');
    await page.locator('footer input[type="email"]').fill('news@example.com');
    await page.locator('footer button[type="submit"]').click();
    await expect(page.locator('footer')).toContainText('Thank you for subscribing!');
    await expect.poll(async () => (await getDocs(collection(db, 'newsletterSubscribers'))).size).toBe(1);
  }
  await admin(page, 'Newsletter');
  await expect(page.getByText('Invalid Date')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  const stream = await file.createReadStream();
  let csv = ''; for await (const chunk of stream) csv += chunk;
  expect(csv).toContain('news@example.com'); expect(csv).not.toContain('Invalid Date');
});

test('face model loading failures offer a retry', async ({ page }) => {
  await page.route('**/models/**', route => route.abort());
  await page.goto('/search-face');
  await expect(page.getByRole('button', { name: 'Retry loading models' })).toBeVisible();
});

test('gallery uploads reach Storage and appear publicly', async ({ page }) => {
  await admin(page, 'Media');
  await page.locator('input[type="file"]').setInputFiles({ name: 'community.png', mimeType: 'image/png', buffer: png });
  await page.getByPlaceholder('Enter image caption...').fill('Uploaded community photo');
  await page.getByLabel('Category', { exact: true }).fill('education');
  await page.getByRole('button', { name: /Upload to Gallery/ }).click();
  await expect.poll(async () => (await getDocs(collection(db, 'gallery'))).size).toBe(1);
  const item = (await getDocs(collection(db, 'gallery'))).docs[0].data();
  expect(item.category).toBe('education');
  expect((await getMetadata(ref(storage, item.url))).size).toBeGreaterThan(0);
  await page.goto('/gallery');
  await expect(page.getByAltText('Uploaded community photo')).toBeVisible();
  await admin(page, 'Media');
  await page.getByTitle('Delete image').click({ force: true });
  await expect.poll(async () => (await getDocs(collection(db, 'gallery'))).size).toBe(0);
  await expect(getMetadata(ref(storage, item.url))).rejects.toMatchObject({ code: 'storage/object-not-found' });
});

test('event details save and export, and event deletion cleans up images', async ({ page }) => {
  const file = ref(storage, 'events/test/photo.png');
  await uploadBytes(file, png, { contentType: 'image/png' });
  const url = await getDownloadURL(file);
  await seed('events', 'test', { name: 'Community event', description: 'A community event.', startDate: '2026-10-01', endDate: '2026-10-02', createdAt: Timestamp.now(), images: [{ url, name: 'photo.png' }] });
  await admin(page, 'Events');
  await page.getByRole('button', { name: 'Edit event details' }).click();
  await page.getByLabel('Event name', { exact: true }).fill('Updated community event');
  await page.getByRole('button', { name: 'Save event', exact: true }).click();
  await expect.poll(async () => (await read('events', 'test'))?.name).toBe('Updated community event');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export CSV/ }).click();
  expect((await download).suggestedFilename()).toBe('events.csv');
  await page.goto('/events/test');
  await expect(page.getByRole('heading', { name: 'Updated community event' })).toBeVisible();
  await admin(page, 'Events');
  await page.getByRole('button', { name: /Delete Event/ }).click();
  await expect.poll(() => read('events', 'test')).toBeUndefined();
  await expect(getMetadata(file)).rejects.toMatchObject({ code: 'storage/object-not-found' });
});

test('volunteer applications submit through all three steps', async ({ page }) => {
  await page.goto('/volunteer');
  for (const [name, value] of Object.entries({ name: 'Application Volunteer', email: 'application@example.com', phone: '9876543210', age: '25' })) await page.locator(`[name="${name}"]`).fill(value);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('Teaching & Tutoring', { exact: true }).click();
  await page.getByText('Weekends (Sat-Sun)', { exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.locator('[name="motivation"]').fill('I would like to help local students learn and build confidence through weekly tutoring.');
  await page.locator('[name="emergencyContact"]').fill('Family 9876543211');
  await page.locator('[name="agreement"]').check();
  await page.getByRole('button', { name: 'Submit Application' }).click();
  await expect(page.getByRole('heading', { name: 'Application Submitted Successfully!' })).toBeVisible();
  await admin(page, 'Volunteers');
  await expect(page.getByText('Application Volunteer', { exact: true })).toBeVisible();
  await expect(page.getByText('teaching', { exact: true })).toBeVisible();
});

test('stories can be submitted and reviewed by admin', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Share Your Story', exact: true }).click();
  await page.getByPlaceholder('Enter your full name').fill('Community Member');
  await page.getByRole('dialog', { name: 'Share Your Story' }).locator('[name="email"]').fill('member@example.com');
  await page.locator('textarea[name="story"]').fill('The community kitchen helped our family. Thank you.');
  await page.locator('form').filter({ has: page.locator('textarea[name="story"]') }).getByRole('button', { name: 'Share Your Story' }).click();
  await expect.poll(async () => (await getDocs(collection(db, 'stories'))).size).toBe(1);
  await admin(page, 'Stories');
  await expect(page.getByText('The community kitchen helped our family. Thank you.')).toBeVisible();
});

test('face models load and mobile navigation remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/search-face');
  await expect(page.getByRole('heading', { name: '1. Upload Your Image' })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('nav')).toHaveCount(2);
  await page.locator('nav').last().getByRole('link', { name: 'Donate' }).click();
  await expect(page.getByRole('heading', { name: 'Make Your Donation' })).toBeVisible();
  await expect(page.getByLabel('Custom amount')).toBeVisible();
});
