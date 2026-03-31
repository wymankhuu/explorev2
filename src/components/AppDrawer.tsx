'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, Star, ExternalLink, Shuffle, FolderPlus, MapPin, BookOpen, TrendingUp, LinkIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { App } from '@/lib/types';
import { getInitials, formatNumber, shortDesc } from '@/lib/utils';
import AdminPanel from './AdminPanel';

interface AppDrawerProps {
  app: App;
  onClose: () => void;
  adminMode: boolean;
  onAdminToggle: () => void;
  onAppUpdated: (updatedFields: Partial<App>) => void;
  starCount?: number;
  isStarred?: boolean;
  onToggleStar?: () => void;
  allApps?: App[];
  onNavigate?: (app: App) => void;
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
      {copied ? 'Copied!' : 'Copy App Link'}
    </button>
  );
}

export default function AppDrawer({ app, onClose, adminMode, onAdminToggle, onAppUpdated, starCount = 0, isStarred = false, onToggleStar, allApps, onNavigate }: AppDrawerProps) {
  const initials = getInitials(app.creator || 'Unknown');

  // Keyboard navigation: Escape to close, Arrow keys to browse
  const currentIndex = allApps?.findIndex((a) => a.id === app.id) ?? -1;
  const prevApp = allApps && currentIndex > 0 ? allApps[currentIndex - 1] : null;
  const nextApp = allApps && currentIndex >= 0 && currentIndex < allApps.length - 1 ? allApps[currentIndex + 1] : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prevApp && onNavigate) onNavigate(prevApp);
      if (e.key === 'ArrowRight' && nextApp && onNavigate) onNavigate(nextApp);
    },
    [onClose, prevApp, nextApp, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Related apps: same tags, different app
  const relatedApps = allApps
    ? allApps
        .filter((a) => a.id !== app.id && a.tags.some((t) => app.tags.includes(t)))
        .slice(0, 3)
    : [];

  return (
    <div
      className="drawer-overlay fixed inset-0 z-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Panel */}
      <div className="drawer-panel relative w-full max-w-[440px] bg-white h-full overflow-y-auto shadow-2xl border-l border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-playlab-blue">App Details</span>
            {allApps && allApps.length > 1 && (
              <span className="text-xs text-slate-400 ml-1">
                {currentIndex + 1}/{allApps.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onNavigate && prevApp && (
              <button
                onClick={() => onNavigate(prevApp)}
                className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Previous app (←)"
              >
                <ChevronLeft size={18} className="text-slate-400" />
              </button>
            )}
            {onNavigate && nextApp && (
              <button
                onClick={() => onNavigate(nextApp)}
                className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                title="Next app (→)"
              >
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* App name + star */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg font-bold text-playlab-blue leading-snug">{app.name}</h1>
            <button
              onClick={() => onToggleStar?.()}
              className="flex items-center gap-1 shrink-0 mt-0.5 transition-colors"
              aria-label={isStarred ? 'Unstar this app' : 'Star this app'}
            >
              <Star
                size={20}
                strokeWidth={1.5}
                className={isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400 cursor-pointer'}
              />
              {starCount > 0 && (
                <span className="text-xs text-slate-400">{starCount}</span>
              )}
            </button>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="text-sm leading-snug">
              <div className="font-medium text-playlab-blue">
                {app.creator || 'Unknown'}
              </div>
              {app.role && <div className="text-slate-500">{app.role}</div>}
              {app.tags.length > 0 && (
                <div className="text-slate-500 flex items-center gap-1 text-xs">
                  <MapPin size={10} />
                  Location
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">About</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {app.description || 'No description available.'}
            </p>
          </div>

          {/* How It's Being Used */}
          <div className="bg-emerald-50 rounded-lg p-3.5 border border-emerald-100">
            <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
              <BookOpen size={14} strokeWidth={1.8} />
              How It&apos;s Being Used
            </h3>
            <p className="text-sm text-emerald-600 leading-relaxed">
              {app.usage || (
                <span className="italic text-emerald-400">Usage details coming soon</span>
              )}
            </p>
          </div>

          {/* Impact */}
          <div className="bg-blue-50 rounded-lg p-3.5 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} strokeWidth={1.8} />
              Impact
            </h3>
            <p className="text-sm text-blue-600 leading-relaxed">
              {app.impact || (
                <span className="italic text-blue-400">Impact details coming soon</span>
              )}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shuffle size={14} strokeWidth={1.5} />
              <span>{formatNumber(app.iterations)} remixes</span>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
              <FolderPlus size={14} strokeWidth={1.8} />
              Resources
            </h3>
            <p className="text-sm text-slate-500 italic">No resources added yet</p>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {app.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-slate-200 text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Admin Panel */}
          {adminMode && (
            <AdminPanel app={app} onAppUpdated={onAppUpdated} />
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors text-sm"
              >
                <ExternalLink size={14} />
                Try App
              </a>
            )}
            {app.url && (
              <a
                href={app.url.replace('/project/', '/remix/')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-playlab-blue hover:bg-slate-800 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Shuffle size={14} />
                Remix
              </a>
            )}
            {app.url && <CopyLinkButton url={app.url} />}
          </div>

          {/* Related Apps */}
          {relatedApps.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Related Apps</h3>
              <div className="space-y-2">
                {relatedApps.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onNavigate?.(related)}
                    className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white text-[9px] font-bold shrink-0 mt-0.5">
                      {getInitials(related.creator || 'U')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-playlab-blue truncate">{related.name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{shortDesc(related.description)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin toggle */}
          <div className="pt-3 pb-1">
            <button
              onClick={onAdminToggle}
              className="text-[10px] text-slate-200 hover:text-slate-500 transition-colors"
            >
              {adminMode ? 'Exit Admin' : '···'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
