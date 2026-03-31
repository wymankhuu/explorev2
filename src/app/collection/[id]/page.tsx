import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAllData } from '@/lib/notion';
import CollectionDetailPage from './CollectionDetailPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { collections } = await getAllData();
  const collection = collections.find((c) => c.id === id);

  if (!collection) notFound();

  return (
    <Suspense>
      <CollectionDetailPage collection={collection} />
    </Suspense>
  );
}
