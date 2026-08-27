import { redirect } from 'next/navigation';

export default async function ProductRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug) : '';
  if (slug) {
    redirect(`/products/${slug}`);
  }
  redirect('/');
}
