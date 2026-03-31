import { Suspense } from 'react';
import { getAllData } from '@/lib/notion';
import HomePage from '@/components/HomePage';
import creatorsData from '@/data/creators.json';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { apps, collections, seedCollections } = await getAllData();

  return (
    <Suspense>
      <HomePage
        apps={apps}
        collections={collections}
        seedCollections={seedCollections}
        creators={creatorsData}
      />
    </Suspense>
  );
}
