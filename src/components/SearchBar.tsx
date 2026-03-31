'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import type { App } from '@/lib/types';
import { getInitials } from '@/lib/utils';

interface CollectionSuggestion {
  id: string;
  name: string;
  iconName: string;
  appCount: number;
}

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  collections?: CollectionSuggestion[];
  onCollectionClick?: (id: string) => void;
  apps?: App[];
  onAppClick?: (app: App) => void;
}

function CollectionIcon({ name }: { name: string }) {
  return <DynamicIcon name={name} size={14} strokeWidth={1.8} />;
}

export default function SearchBar({ placeholder, value, onChange, collections, onCollectionClick, apps, onAppClick }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const q = value.toLowerCase().trim();

  const matchedCollections = q && collections
    ? collections.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedApps = q && apps
    ? apps.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.creator.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const showDropdown = focused && (matchedCollections.length > 0 || matchedApps.length > 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-xs"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {/* App results */}
          {matchedApps.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Apps</div>
              {matchedApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onAppClick?.(app);
                    setFocused(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-white text-[9px] font-bold shrink-0">
                    {getInitials(app.creator || 'U')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-800 truncate">{app.name}</div>
                    <div className="text-xs text-slate-400 truncate">{app.creator || 'Unknown'}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Collection results */}
          {matchedCollections.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Collections</div>
              {matchedCollections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onCollectionClick?.(c.id);
                    setFocused(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-primary shrink-0">
                    <CollectionIcon name={c.iconName} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-800 truncate">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.appCount} apps</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
