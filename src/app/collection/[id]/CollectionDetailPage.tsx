'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LinkIcon, QrCode, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { App, Collection } from '@/lib/types';
import AppCard from '@/components/AppCard';
import AppDrawer from '@/components/AppDrawer';
import ScrollToTop from '@/components/ScrollToTop';
import AdminToolbar from '@/components/AdminToolbar';

function CollectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.FolderOpen;
  return <Icon size={28} strokeWidth={1.8} className={className} />;
}

function ShareBar({ collectionId }: { collectionId: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/collection/${collectionId}`
    : `/collection/${collectionId}`;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <button
        onClick={() => setShowQr(!showQr)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <QrCode size={14} />
        QR code
      </button>

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowQr(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <img src={qrSrc} alt="QR code for this collection" width={200} height={200} className="mx-auto rounded-lg" />
            <p className="text-xs text-slate-500 mt-3 max-w-[200px] break-all">{url}</p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectionDetailPage({ collection }: { collection: Collection }) {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  return (
    <div className="min-h-screen pb-20">
      <AdminToolbar apps={collection.apps} />
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link
          href="/?tab=collections"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to collections
        </Link>

        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-start gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50">
              <CollectionIcon name={collection.iconName} className="text-primary" />
            </span>
            <div>
              <h1 className="font-heading text-2xl sm:text-4xl font-semibold text-zinc-800">
                {collection.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {collection.appCount} {collection.appCount === 1 ? 'app' : 'apps'}
              </p>
            </div>
          </div>
          <ShareBar collectionId={collection.id} />
        </div>

        {collection.description && (
          <p className="text-slate-600 leading-relaxed max-w-3xl mb-8">
            {collection.description}
          </p>
        )}

        {/* App grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {collection.apps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>

        {collection.apps.length === 0 && (
          <p className="text-center text-slate-500 py-16 text-sm">
            No apps in this collection yet.
          </p>
        )}
      </div>

      {/* App Drawer */}
      {selectedApp && (
        <AppDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          adminMode={false}
          onAdminToggle={() => {}}
          onAppUpdated={() => {}}
        />
      )}

      <ScrollToTop />
    </div>
  );
}
