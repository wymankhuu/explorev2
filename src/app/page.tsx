import { Suspense } from 'react';
import { getAllData } from '@/lib/notion';
import HomePage from '@/components/HomePage';
import cultivatorsData from '@/data/cultivators.json';

export default async function Page() {
  const { apps, collections, seedCollections } = await getAllData();

  return (
    <Suspense>
      <HomePage
        apps={apps}
        collections={collections}
        seedCollections={seedCollections}
        cultivators={cultivatorsData}
      />
    </Suspense>
  );
}
