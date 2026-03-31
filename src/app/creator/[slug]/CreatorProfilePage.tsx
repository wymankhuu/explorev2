'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shuffle, Star, Users, LinkIcon, Check } from 'lucide-react';
import type { App } from '@/lib/types';
import { getInitials, formatNumber, generateCollectionId, generateCreatorSlug, stringToColor } from '@/lib/utils';
import AppCard from '@/components/AppCard';
import AppDrawer from '@/components/AppDrawer';
import ScrollToTop from '@/components/ScrollToTop';
import { useStars } from '@/components/useStars';

interface Peer {
  name: string;
  role: string;
  slug: string;
}

interface CreatorProfilePageProps {
  creator: string;
  role: string;
  apps: App[];
  peers?: Peer[];
}

export default function CreatorProfilePage({ creator, role, apps, peers = [] }: CreatorProfilePageProps) {
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [copied, setCopied] = useState(false);

  const appIds = useMemo(() => apps.map((a) => a.id), [apps]);
  const { starCounts, starred, toggleStar } = useStars(appIds);

  const totalStars = Object.values(starCounts).reduce((sum, n) => sum + n, 0);
  const totalSessions = apps.reduce((sum, a) => sum + (a.sessions || 0), 0);
  const totalRemixes = apps.reduce((sum, a) => sum + (a.iterations || 0), 0);

  // Featured app = most starred (only if 2+ apps)
  const featuredApp = useMemo(() => {
    if (apps.length < 2) return null;
    return apps.reduce((best, app) =>
      (starCounts[app.id] || 0) > (starCounts[best.id] || 0) ? app : best
    , apps[0]);
  }, [apps, starCounts]);

  // All apps sorted by stars
  const sortedApps = useMemo(() =>
    [...apps].sort((a, b) => (starCounts[b.id] || 0) - (starCounts[a.id] || 0)),
    [apps, starCounts]
  );

  // Unique collection tags
  const collections = useMemo(() => {
    const tags = [...new Set(apps.flatMap((a) => a.tags))];
    return tags.map((t) => ({ name: t, id: generateCollectionId(t) }));
  }, [apps]);

  const initials = getInitials(creator);
  const avatarColor = stringToColor(creator);

  const handleShareProfile = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Explore
        </Link>

        {/* Profile Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800">
                {creator}
              </h1>
              {role && (
                <p className="text-sm text-slate-500 mt-0.5">{role}</p>
              )}
              <div className="flex items-center gap-5 mt-3 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Users size={14} strokeWidth={1.5} />
                  <span>{apps.length} {apps.length === 1 ? 'app' : 'apps'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={14} strokeWidth={1.5} />
                  <span>{totalStars} {totalStars === 1 ? 'star' : 'stars'}</span>
                </div>
                {totalSessions > 0 && (
                  <span>{formatNumber(totalSessions)} sessions</span>
                )}
                {totalRemixes > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Shuffle size={14} strokeWidth={1.5} />
                    <span>{formatNumber(totalRemixes)} remixes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleShareProfile}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Featured App */}
        {featuredApp && featuredApp.usage && (
          <div className="mb-10 bg-gradient-to-br from-blue-50 via-sky-50/70 to-cyan-50/80 rounded-xl border border-blue-200 p-6">
            <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">Featured App</h2>
            <h3 className="text-lg font-bold text-zinc-800 mb-2">{featuredApp.name}</h3>
            <blockquote className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-blue-300 pl-4 mb-4">
              &ldquo;{featuredApp.usage}&rdquo;
            </blockquote>
            <div className="flex gap-2">
              {featuredApp.url && (
                <a
                  href={featuredApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  Try App
                </a>
              )}
              {featuredApp.url && (
                <a
                  href={featuredApp.url.replace('/project/', '/remix/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-playlab-blue px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  <Shuffle size={14} />
                  Remix
                </a>
              )}
            </div>
          </div>
        )}

        {/* All Apps */}
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold text-zinc-800 mb-4">
            All Apps by {creator.split(' ')[0]}
          </h2>
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
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Collections</h2>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/collection/${c.id}`}
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* More from this org */}
        {peers.length > 0 && role && (
          <div className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-zinc-800 mb-3">
              More builders from {role}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {peers.map((p) => (
                <Link
                  key={p.slug}
                  href={`/creator/${p.slug}`}
                  className="flex-none flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: stringToColor(p.name) }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.role}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
