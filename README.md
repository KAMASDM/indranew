# Indraprasth Foundation website

Next.js App Router, React, Tailwind CSS, and Firebase Firestore/Storage. Public pages and the admin dashboard share the same Firebase content. Admin remains open by request; authentication has not been added.

## Development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and enter the Firebase web app configuration (or use your existing `.env`).
3. Run `npm run dev` and open http://localhost:3000.

For production: `npm run build`, then `npm start`. Firebase access is governed by the project's deployed Firestore and Storage rules; this repository does not deploy or change those rules.

## Admin and content

Visit `/admin` to manage hero images, About content, events, initiatives, gallery images, blog posts, volunteer applications, contact messages, newsletter subscribers, submitted stories, and donation references.

- About fields are read from `content/about`, with existing page copy as the fallback.
- Blog posts are stored in `news`; `/news` and `/news/:slug` redirect to the canonical blog routes. Content and previews accept Markdown and existing HTML, with unsafe HTML removed before rendering.
- Gallery uploads include a category. Existing uncategorized images appear under General. Caption and category edits save directly to Firestore.
- Initiative image removal is staged until Save. Cancelling the editor leaves the stored files intact.
- Event/initiative deletion removes their stored images. Newsletter and event lists can be exported as CSV.
- Story submissions are available for review in admin; they are not automatically published.

Firestore collections: `heroImages`, `initiatives`, `events`, `gallery`, `news`, `testimonials`, `stories`, `volunteerApplications`, `contactMessages`, `newsletterSubscribers`, and `donations`. Existing ISO dates and Firestore timestamps are both supported.

## Donations

The donation page uses the existing UPI QR image in `src/img/indra-qr.png`. Donors select an amount, complete payment in their UPI app, and submit their name, email, and transaction reference. References are saved to `donations` with status `pending`.

An admin must check the payment against the foundation's payment records before choosing **Mark verified**. The submission is not an automatic payment confirmation or receipt. Monthly support is a preference for manual payments; the site does not create recurring debits or send certificates automatically.

## Images and face search

Missing images use `public/image-placeholder.svg`. Face matching runs in the browser using the model files in `public/models`; the supplied reference photo is not uploaded by the search feature. The advanced detector is loaded only when selected. Gallery photos are fetched for comparison, so Storage CORS must allow the site's origin (see `cors.json`). Similarity scores are not probabilities of identity.

Social icons are shown only when their optional `NEXT_PUBLIC_*_URL` environment variables contain HTTPS profile links. Requests for reports or financial information go to the contact form until dedicated content is provided.

## Verification

```sh
npm run lint
npm test
npm run build
npm audit
```

Browser integration tests use Playwright and Firebase emulators, including real Firestore writes and Storage uploads/deletions in the isolated `demo-indra` project:

```sh
npx playwright install chromium
npm run test:e2e
```

The emulator CLI requires a supported Node.js version and Java 21 or newer. The first run downloads the Firebase CLI/emulators. Ports 8180 (Firestore), 9299 (Storage), and 3138 (test website) must be available. Playwright sets the demo Firebase configuration and uses `.next-test`, leaving the production build and live data untouched.

`tests/firestore.rules` and `tests/storage.rules` are permissive local test fixtures, not production rules. `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` is set by the test runner only. Unit tests cover date conversion, image URL normalization, safe CSV output, impact animation, donation amounts, and HTML sanitization. Browser tests cover navigation, content edits, submissions, uploads, deletion, pagination, face-model loading, and mobile navigation.
