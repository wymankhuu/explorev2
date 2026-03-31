'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobeIcon } from 'lucide-react';
import type { App, Collection, SeedCollection } from '@/lib/types';
import { FILTER_OPTIONS, getContainerTheme, COMMUNITY_COLLECTION_NAMES } from '@/lib/utils';
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
    tabParam && ['apps', 'starters', 'collections', 'communities'].includes(tabParam) ? tabParam : 'apps'
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

  // Deep link: ?app=<id> opens the drawer on load
  useEffect(() => {
    const appId = searchParams.get('app');
    if (appId && !selectedApp) {
      const found = apps.find((a) => a.id === appId);
      if (found) setSelectedApp(found);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync ?app= param when drawer opens/closes
  const handleSelectApp = useCallback((app: App | null) => {
    setSelectedApp(app);
    const url = new URL(window.location.href);
    if (app) {
      url.searchParams.set('app', app.id);
    } else {
      url.searchParams.delete('app');
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const { isAdmin, password: adminPassword } = useAdmin();
  const [adminMode, setAdminMode] = useState(false);
  useEffect(() => {
    setAdminMode(isAdmin);
  }, [isAdmin]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});

  // Apply optimistic pin overrides to apps
  const effectiveApps = useMemo(() =>
    apps.map((a) => a.id in pinOverrides ? { ...a, pinned: pinOverrides[a.id] } : a),
    [apps, pinOverrides]
  );

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedApps = useMemo(() =>
    effectiveApps.filter((a) => selectedIds.has(a.id)),
    [effectiveApps, selectedIds]
  );

  const handleBulkComplete = useCallback((pinned: boolean, appIds: string[]) => {
    setSelectedIds(new Set());
    setPinOverrides((prev) => {
      const next = { ...prev };
      for (const id of appIds) next[id] = pinned;
      return next;
    });
  }, []);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Stars
  const appIds = useMemo(() => apps.map((a) => a.id), [apps]);
  const { starCounts, starred, toggleStar } = useStars(appIds);

  const showcaseApps = useMemo(() => {
    // Pick top 2 apps from each collection for high variety
    const seen = new Set<string>();
    const collectionPicks: App[] = [];
    // Group apps by collection tag, take top 2 per collection (by sessions)
    const byCollection = new Map<string, App[]>();
    for (const app of effectiveApps) {
      for (const tag of app.tags) {
        if (!byCollection.has(tag)) byCollection.set(tag, []);
        byCollection.get(tag)!.push(app);
      }
    }
    // Sort collections randomly but deterministically by name hash for variety
    const collectionNames = [...byCollection.keys()].sort();
    for (const name of collectionNames) {
      const apps = byCollection.get(name)!
        .sort((a, b) => (b.sessions || 0) - (a.sessions || 0));
      let count = 0;
      for (const app of apps) {
        if (count >= 2) break;
        if (!seen.has(app.id)) {
          seen.add(app.id);
          collectionPicks.push(app);
          count++;
        }
      }
    }
    return collectionPicks;
  }, [effectiveApps]);


  const filteredApps = useMemo(() => {
    let result = effectiveApps;
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
  }, [effectiveApps, debouncedQuery, selectedFilters]);

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

  const filteredAppCollections = useMemo(() =>
    filteredCollections.filter((col) => !COMMUNITY_COLLECTION_NAMES.includes(col.name)),
    [filteredCollections]
  );

  const filteredCommunityCollections = useMemo(() =>
    filteredCollections.filter((col) => COMMUNITY_COLLECTION_NAMES.includes(col.name)),
    [filteredCollections]
  );

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
      handleSelectApp({ ...selectedApp, ...updatedFields });
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
      <AdminToolbar apps={effectiveApps} />
      {/* Hero — matches Playlab dev explore page */}
      <div className="explore-hero mb-8 p-8 text-center lg:p-12">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          <h1 className="hidden w-full lg:block font-heading text-4xl md:text-5xl font-medium text-slate-900 text-balance">
            Explore Community Apps
          </h1>
          <p className="hidden w-full lg:block text-lg sm:text-xl font-normal text-zinc-700 leading-relaxed">
            Educators across the country are using Playlab to build AI-powered tools shaped by their own classrooms, students, and communities. Every app here was created by someone who understands their context best. Explore what they&apos;ve built and make it your own.
          </p>
          {/* Mobile title — simpler, always visible */}
          <h1 className="lg:hidden font-heading text-2xl font-medium text-slate-900">
            Explore Community Apps
          </h1>
          <p className="lg:hidden text-sm text-zinc-700">
            AI-powered tools built by educators, for their own classrooms and communities. Explore some today!
          </p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex justify-center mb-5">
        <TabToggle activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto px-4 mb-3">
        <SearchBar
          placeholder={activeTab === 'apps' ? 'Search apps...' : activeTab === 'starters' ? 'Search starters...' : activeTab === 'communities' ? 'Search communities...' : 'Search collections...'}
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
          onClearAll={() => { setSearchQuery(''); setSelectedFilters({}); }}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6">
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
              {isFiltering ? `${filteredApps.length} apps found` : `A diverse selection across ${collections.length} collections — teachers, coaches, students, and leaders building for every subject, grade, and context.`}
            </p>

            {isAdmin && !isFiltering ? (
              <SortableShowcaseGrid
                apps={showcaseApps}
                password={adminPassword}
                starCounts={starCounts}
                starred={starred}
                onToggleStar={toggleStar}
                onAppClick={handleSelectApp}
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
                    onClick={() => handleSelectApp(app)}
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
            <div className="mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800 flex items-center gap-1.5">
                <span>⭐</span> Spotlight Collections
              </h2>
              <p className="text-sm text-slate-500">
                Browse {filteredAppCollections.length} curated collections organized by subject, grade level, and use case. Each collection brings together apps from across the community that share a common purpose.
              </p>
            </div>

            {/* How to use collections */}
            <div className="mb-10 px-6 py-8">
              <div className="flex items-center justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300" />

                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">1</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Browse a collection</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[200px]">Find a topic that fits your classroom, subject, or role</p>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">2</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Try an app</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[220px]">Open any app to see how other educators built it, then try it yourself</p>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center z-10 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-bold ring-4 ring-white shadow-sm">3</div>
                  <h4 className="font-heading font-semibold text-zinc-800 mt-3 text-sm sm:text-base">Remix &amp; share</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-[220px]">Remix any app to make it your own, or share the collection with your team</p>
                </div>
              </div>
            </div>
            {/* App Collections */}
            <div className="flex flex-col gap-8">
              {filteredAppCollections.map((collection, i) => (
                <CollectionSection
                  key={collection.id}
                  collection={collection}
                  onAppClick={(app) => handleSelectApp(app)}
                  colorIndex={i}
                  theme={getContainerTheme(i)}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredAppCollections.length === 0 && (
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
          </>
        )}

        {activeTab === 'communities' && (
          <>
            <div className="mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-zinc-800 flex items-center gap-1.5">
                <span>🌍</span> Community Collections
              </h2>
              <p className="text-sm text-slate-500">
                Explore {filteredCommunityCollections.length} collections built by educator communities and partner organizations. Each collection reflects the unique context, standards, and goals of its community.
              </p>
            </div>
            <div className="flex flex-col gap-8">
              {filteredCommunityCollections.map((collection, i) => (
                <CollectionSection
                  key={collection.id}
                  collection={collection}
                  onAppClick={(app) => handleSelectApp(app)}
                  colorIndex={i}
                  theme={getContainerTheme(i)}
                />
              ))}
              {filteredCommunityCollections.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-500 text-sm mb-2">No community collections match your search or filters.</p>
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
          onClose={() => handleSelectApp(null)}
          adminMode={adminMode}
          onAdminToggle={() => setAdminMode(!adminMode)}
          onAppUpdated={handleAppUpdated}
          starCount={starCounts[selectedApp.id] || 0}
          isStarred={starred.has(selectedApp.id)}
          onToggleStar={() => toggleStar(selectedApp.id)}
          allApps={isFiltering ? filteredApps : showcaseApps}
          onNavigate={handleSelectApp}
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
