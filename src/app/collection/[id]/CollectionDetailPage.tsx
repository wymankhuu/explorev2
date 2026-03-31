'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, LinkIcon, QrCode, Check, Users, Shuffle } from 'lucide-react';
import DynamicIcon from '@/components/DynamicIcon';
import type { App, Collection } from '@/lib/types';
import AppCard from '@/components/AppCard';
import AppDrawer from '@/components/AppDrawer';
import ScrollToTop from '@/components/ScrollToTop';
import AdminToolbar from '@/components/AdminToolbar';
import SortableShowcaseGrid from '@/components/SortableShowcaseGrid';
import { useAdmin } from '@/hooks/useAdmin';
import { useStars } from '@/components/useStars';
import { getCollectionDisplayName, getThemeForCollection, COMMUNITY_COLLECTION_NAMES, getInitials, stringToColor } from '@/lib/utils';

function CollectionIcon({ name, className }: { name: string; className?: string }) {
  return <DynamicIcon name={name} size={28} strokeWidth={1.8} className={className} />;
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
  const { isAdmin, password: adminPassword } = useAdmin();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const sortedApps = [...collection.apps].sort((a, b) => a.name.localeCompare(b.name));

  const appIds = useMemo(() => collection.apps.map((a) => a.id), [collection.apps]);
  const { starCounts, starred, toggleStar } = useStars(appIds);

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const displayName = getCollectionDisplayName(collection.name);
  const theme = getThemeForCollection(collection.name);
  const isCommunity = COMMUNITY_COLLECTION_NAMES.includes(collection.name);

  // Community stats
  const uniqueCreators = [...new Set(collection.apps.map((a) => a.creator).filter(Boolean))];
  const totalSessions = collection.apps.reduce((sum, a) => sum + (a.sessions || 0), 0);
  const totalRemixes = collection.apps.reduce((sum, a) => sum + (a.iterations || 0), 0);

  return (
    <div className="min-h-screen pb-20">
      <AdminToolbar apps={collection.apps} />

      {/* Hero Banner */}
      <div className={`${theme.bannerBg} border-b ${theme.bannerBorder}`}>
        <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
          <a
            href="/?tab=collections"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-5"
          >
            <ArrowLeft size={16} />
            Back to collections
          </a>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${theme.iconBg}`}>
                <CollectionIcon name={collection.iconName} className={theme.bannerIcon} />
              </span>
              <div>
                <h1 className="font-heading text-2xl sm:text-4xl font-bold text-slate-900">
                  {displayName}
                </h1>
                <p className="text-slate-500 mt-1">
                  {collection.appCount} {collection.appCount === 1 ? 'app' : 'apps'}
                </p>
              </div>
            </div>
            <ShareBar collectionId={collection.id} />
          </div>

          {collection.description && (
            <p className="text-slate-600 leading-relaxed max-w-3xl mt-4 text-[15px]">
              {collection.description}
            </p>
          )}

          {/* Community stats */}
          {isCommunity && (
            <div className="flex items-center gap-6 mt-5 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>{uniqueCreators.length} {uniqueCreators.length === 1 ? 'builder' : 'builders'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shuffle size={14} />
                <span>{totalRemixes} remixes</span>
              </div>
              {totalSessions > 0 && (
                <span>{totalSessions >= 1000 ? `${(totalSessions / 1000).toFixed(1)}K` : totalSessions} sessions</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8">

        {/* Contributors (community only) */}
        {isCommunity && uniqueCreators.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Contributors</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueCreators.slice(0, 12).map((name) => (
                <div key={name} className="flex items-center gap-2 rounded-full bg-white border border-slate-200 pl-1 pr-3 py-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                    style={{ backgroundColor: stringToColor(name) }}
                  >
                    {getInitials(name)}
                  </div>
                  <span className="text-sm text-slate-700">{name}</span>
                </div>
              ))}
              {uniqueCreators.length > 12 && (
                <span className="text-sm text-slate-400 self-center ml-1">+{uniqueCreators.length - 12} more</span>
              )}
            </div>
          </div>
        )}

        {/* App grid */}
        {isAdmin ? (
          <SortableShowcaseGrid
            apps={sortedApps}
            password={adminPassword}
            starCounts={starCounts}
            starred={starred}
            onToggleStar={toggleStar}
            onAppClick={setSelectedApp}
            isAdminMode={true}
            selectedIds={selectedIds}
            onSelectToggle={handleSelectToggle}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sortedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onClick={() => setSelectedApp(app)}
                starCount={starCounts[app.id] || 0}
                isStarred={starred.has(app.id)}
                onToggleStar={() => toggleStar(app.id)}
              />
            ))}
          </div>
        )}

        {sortedApps.length === 0 && (
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
          starCount={starCounts[selectedApp.id] || 0}
          isStarred={starred.has(selectedApp.id)}
          onToggleStar={() => toggleStar(selectedApp.id)}
          allApps={sortedApps}
          onNavigate={setSelectedApp}
        />
      )}

      <ScrollToTop />
    </div>
  );
}
