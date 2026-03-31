'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobeIcon } from 'lucide-react';
import type { App, Collection, SeedCollection } from '@/lib/types';
import { FILTER_OPTIONS, getContainerTheme } from '@/lib/utils';
import AppCard from './AppCard';
import AppDrawer from './AppDrawer';
import CollectionSection from './CollectionSection';
import FilterBar from './FilterBar';
import SearchBar from './SearchBar';
import StarterSection from './StarterSection';
import SubmitAppModal from './SubmitAppModal';
import TabToggle, { type TabId } from './TabToggle';
import ScrollToTop from './ScrollToTop';
import { useStars } from './useStars';
import AdminToolbar from './AdminToolbar';
import { useAdmin } from '@/hooks/useAdmin';
import SortableShowcaseGrid from './SortableShowcaseGrid';
import BulkActionBar from './BulkActionBar';

interface HomePageProps {
  apps: App[];
  collections: Collection[];
  seedCollections: SeedCollection[];
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function HomePage({ apps, collections, seedCollections }: HomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-driven tab state
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ['apps', 'starters', 'collections'].includes(tabParam) ? tabParam : 'apps'
  );

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const { isAdmin, password: adminPassword } = useAdmin();
  const [adminMode, setAdminMode] = useState(false);
  useEffect(() => {
    setAdminMode(isAdmin);
  }, [isAdmin]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedApps = useMemo(() =>
    apps.filter((a) => selectedIds.has(a.id)),
    [apps, selectedIds]
  );

  const handleBulkComplete = useCallback(() => {
    setSelectedIds(new Set());
    window.location.reload();
  }, []);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Stars
  const appIds = useMemo(() => apps.map((a) => a.id), [apps]);
  const { starCounts, starred, toggleStar } = useStars(appIds);

  const showcaseApps = useMemo(() => {
    return apps
      .filter((app) => app.pinned)
      .sort((a, b) => (a.homepageOrder ?? 999) - (b.homepageOrder ?? 999));
  }, [apps]);

  const filteredApps = useMemo(() => {
    let result = apps;
    const q = debouncedQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.creator.toLowerCase().includes(q) ||
          app.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const activeFilters = Object.entries(selectedFilters).filter(
      ([, values]) => values.length > 0
    );
    if (activeFilters.length > 0) {
      result = result.filter((app) =>
        activeFilters.every(([, values]) =>
          values.some((v) =>
            app.tags.some((t) => t.toLowerCase() === v.toLowerCase())
          )
        )
      );
    }

    return result;
  }, [apps, debouncedQuery, selectedFilters]);

  const filteredCollections = useMemo(() => {
    let result = collections;
    const q = debouncedQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(
        (col) =>
          col.name.toLowerCase().includes(q) ||
          col.description.toLowerCase().includes(q)
      );
    }

    const activeFilters = Object.entries(selectedFilters).filter(
      ([, values]) => values.length > 0
    );
    if (activeFilters.length > 0) {
      result = result.filter((col) =>
        activeFilters.some(([, values]) =>
          values.some(
            (v) =>
              col.name.toLowerCase() === v.toLowerCase() ||
              col.apps.some((app) =>
                app.tags.some((t) => t.toLowerCase() === v.toLowerCase())
              )
          )
        )
      );
    }

    return result;
  }, [collections, debouncedQuery, selectedFilters]);

  const filteredSeedCollections = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return seedCollections;

    return seedCollections
      .map((sc) => ({
        ...sc,
        apps: sc.apps.filter(
          (seed) =>
            seed.name.toLowerCase().includes(q) ||
            seed.description.toLowerCase().includes(q) ||
            seed.tags.some((t) => t.toLowerCase().includes(q))
        ),
      }))
      .filter((sc) => sc.apps.length > 0);
  }, [seedCollections, debouncedQuery]);

  const handleFilterChange = (category: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [category]: values }));
  };

  const handleAppUpdated = (updatedFields: Partial<App>) => {
    if (selectedApp) {
      setSelectedApp({ ...selectedApp, ...updatedFields });
    }
  };

  const collectionSuggestions = useMemo(() =>
    collections.map((c) => ({ id: c.id, name: c.name, iconName: c.iconName, appCount: c.appCount })),
    [collections]
  );

  const handleCollectionClick = useCallback((id: string) => {
    router.push(`/collection/${id}`);
  }, [router]);

  const isFiltering = debouncedQuery || Object.values(selectedFilters).some((v) => v.length > 0);

  return (
    <div className="min-h-screen pb-20">
      <AdminToolbar apps={apps} />
      {/* Hero — matches Playlab dev explore page */}
      <div className="explore-hero mb-8 p-8 text-center lg:p-12">
        <div className="flex flex-col gap-4">
          <h1 className="hidden w-full lg:block font-heading text-4xl md:text-5xl font-medium text-slate-900 text-balance">
            Explore Community Apps
          </h1>
          <p className="hidden w-full lg:block text-xl sm:text-2xl font-normal text-zinc-800">
            Apps made by the Playlab community, ready to try &amp; remix.
          </p>
          {/* Mobile title — simpler, always visible */}
          <h1 className="lg:hidden font-heading text-2xl font-medium text-slate-900">
            Explore Community Apps
          </h1>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex justify-center mb-5">
        <TabToggle activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto px-4 mb-3">
        <SearchBar
          placeholder={activeTab === 'apps' ? 'Search apps...' : activeTab === 'starters' ? 'Search starters...' : 'Search collections...'}
          value={searchQuery}
          onChange={setSearchQuery}
          collections={collectionSuggestions}
          onCollectionClick={handleCollectionClick}
        />
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <FilterBar
          filters={FILTER_OPTIONS}
          selected={selectedFilters}
          onChange={handleFilterChange}
        />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6">
        {activeTab === 'apps' && (
          <>
            {/* Showcase header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800 flex items-center gap-1.5">
                <span>🌟</span> Showcase Apps
              </h2>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-dark transition-colors"
              >
                <GlobeIcon className="w-4 h-4" />
                Submit your App for Review
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              {isFiltering ? `${filteredApps.length} apps found` : `${showcaseApps.length} apps showcased`}
            </p>

            {isAdmin && !isFiltering ? (
              <SortableShowcaseGrid
                apps={showcaseApps}
                password={adminPassword}
                starCounts={starCounts}
                starred={starred}
                onToggleStar={toggleStar}
                onAppClick={setSelectedApp}
                searchQuery={debouncedQuery || undefined}
                isAdminMode={true}
                selectedIds={selectedIds}
                onSelectToggle={handleSelectToggle}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {(isFiltering ? filteredApps : showcaseApps).map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onClick={() => setSelectedApp(app)}
                    starCount={starCounts[app.id] || 0}
                    isStarred={starred.has(app.id)}
                    onToggleStar={() => toggleStar(app.id)}
                    searchQuery={debouncedQuery || undefined}
                    isAdminMode={isAdmin}
                    isSelected={selectedIds.has(app.id)}
                    onSelectToggle={() => handleSelectToggle(app.id)}
                  />
                ))}
              </div>
            )}
            {isFiltering && filteredApps.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-sm mb-2">No apps match your search or filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedFilters({}); }}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'starters' && (
          <>
            <div className="mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800 flex items-center gap-1.5">
                <span>🌱</span> Starter Templates
              </h2>
              <p className="text-sm text-slate-500">
                Ready-to-remix app templates organized by use case. Pick one and make it your own.
              </p>
            </div>

            {/* How to use starters */}
            <div className="mb-10 px-6 py-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300" />

                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">1</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Pick a starter</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[200px]">Browse starter templates and click &quot;Remix This Starter&quot; to get started</p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">2</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Add your context</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[220px]">Customize it with your curriculum, pedagogy, knowledge, and your voice</p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">3</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Watch it grow</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[220px]">Share it, iterate, and see it come to life in your environments</p>
                </div>
              </div>
            </div>
            {filteredSeedCollections.map((sc, i) => (
              <StarterSection key={sc.id} collection={sc} colorIndex={i} />
            ))}
            {filteredSeedCollections.length === 0 && (
              <div className="text-center py-16">
                <p className="text-slate-500 text-sm mb-2">
                  {searchQuery ? 'No starters match your search.' : 'No starter templates available yet.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'collections' && (
          <>
            <div className="mb-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800 flex items-center gap-1.5">
                <span>⭐</span> Spotlight Collections
              </h2>
              <p className="text-sm text-slate-500">
                {filteredCollections.length} collections shared
              </p>
            </div>
            <div className="flex flex-col gap-8">
              {filteredCollections.map((collection, i) => (
                <CollectionSection
                  key={collection.id}
                  collection={collection}
                  onAppClick={(app) => setSelectedApp(app)}
                  colorIndex={i}
                  theme={getContainerTheme(i)}
                />
              ))}
              {filteredCollections.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-sm mb-2">No collections match your search or filters.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedFilters({}); }}
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* App Drawer */}
      {selectedApp && (
        <AppDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          adminMode={adminMode}
          onAdminToggle={() => setAdminMode(!adminMode)}
          onAppUpdated={handleAppUpdated}
          starCount={starCounts[selectedApp.id] || 0}
          isStarred={starred.has(selectedApp.id)}
          onToggleStar={() => toggleStar(selectedApp.id)}
        />
      )}

      {/* Submit App Modal */}
      {showSubmitModal && (
        <SubmitAppModal onClose={() => setShowSubmitModal(false)} />
      )}

      {/* Bulk Action Bar */}
      {isAdmin && selectedIds.size > 0 && (
        <BulkActionBar
          selectedApps={selectedApps}
          password={adminPassword}
          onClear={() => setSelectedIds(new Set())}
          onComplete={handleBulkComplete}
        />
      )}

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
