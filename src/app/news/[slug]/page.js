// Dynamic blog/news page with SEO
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

export async function generateMetadata({ params }) {
  const slug = params.slug;
  const q = query(collection(db, 'news'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return {};
  const data = snap.docs[0].data();
  return {
    title: data.title,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: data.image ? [{ url: data.image }] : [],
      type: 'article',
      publishedTime: data.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.excerpt,
      image: data.image,
    },
  };
}

export default async function BlogPage({ params }) {
  const slug = params.slug;
  const q = query(collection(db, 'news'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return notFound();
  const data = snap.docs[0].data();
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <Head>
        <title>{data.title}</title>
        <meta name="description" content={data.excerpt} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.excerpt} />
        {data.image && <meta property="og:image" content={data.image} />}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={data.date} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.excerpt} />
        {data.image && <meta name="twitter:image" content={data.image} />}
      </Head>
      <article>
        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
        <div className="text-gray-500 text-sm mb-4">{data.category} | {data.date && new Date(data.date).toLocaleDateString()}</div>
        {data.image && <Image src={data.image} alt={data.title} width={800} height={400} className="rounded-xl mb-6 object-cover" />}
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
      </article>
    </main>
  );
}
