import { notFound } from 'next/navigation';
import { getAllData } from '@/lib/notion';
import { generateCreatorSlug } from '@/lib/utils';
import CreatorProfilePage from './CreatorProfilePage';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { apps } = await getAllData();
  const creatorApps = apps.filter((a) => a.creator && generateCreatorSlug(a.creator) === slug);
  const name = creatorApps[0]?.creator || slug;
  return { title: `${name} — Playlab Explore` };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { apps } = await getAllData();

  const creatorApps = apps.filter((a) => a.creator && generateCreatorSlug(a.creator) === slug);
  if (creatorApps.length === 0) notFound();

  const creator = creatorApps[0].creator;
  const role = creatorApps[0].role;

  // Find other creators from the same org (by role)
  const peers = role
    ? [...new Map(
        apps
          .filter((a) => a.role && a.role.toLowerCase() === role.toLowerCase() && a.creator && generateCreatorSlug(a.creator) !== slug)
          .map((a) => [a.creator.toLowerCase().trim(), { name: a.creator, role: a.role, slug: generateCreatorSlug(a.creator) }])
      ).values()].slice(0, 6)
    : [];

  return <CreatorProfilePage creator={creator} role={role} apps={creatorApps} peers={peers} />;
}
