import { Suspense } from 'react';
import { getAllData } from '@/lib/notion';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard — Playlab Explore',
};

export default async function AdminPage() {
  const { apps, collections } = await getAllData();

  return (
    <Suspense>
      <AdminDashboard apps={apps} collections={collections} />
    </Suspense>
  );
}
