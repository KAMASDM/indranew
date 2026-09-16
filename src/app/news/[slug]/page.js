import { redirect } from 'next/navigation';
export default async function NewsDetail({ params }) {
  const { slug } = await params;
  redirect(`/blog/${encodeURIComponent(slug)}`);
}
