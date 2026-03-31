'use client';

import { Shuffle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Seed, SeedCollection } from '@/lib/types';
import { CONTAINER_THEMES } from '@/lib/utils';

interface StarterSectionProps {
  collection: SeedCollection;
  colorIndex: number;
}

function CollectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Sprout;
  return <Icon size={20} strokeWidth={1.8} className={className} />;
}

function SeedCard({ seed }: { seed: Seed }) {
  return (
    <div className="bg-white rounded-lg border-2 border-slate-200 shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col min-h-[14rem]">
      {/* Playlab avatar — always "P" */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold shrink-0">
          P
        </div>
        <span className="text-sm text-slate-600 truncate">{seed.creator || 'Playlab'}</span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-playlab-blue text-sm mb-1.5 truncate">{seed.name}</h4>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 flex-grow mb-3">
        {seed.description || 'A starter template ready to remix.'}
      </p>

      {/* Tags */}
      {seed.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {seed.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-slate-200 text-slate-600">
              {tag}
            </span>
          ))}
          {seed.tags.length > 3 && (
            <span className="text-[10px] text-slate-500">+{seed.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Action */}
      {seed.remixUrl && (
        <a
          href={seed.remixUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 bg-playlab-blue hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Shuffle size={12} />
          Remix This Starter
        </a>
      )}
    </div>
  );
}

export default function StarterSection({ collection, colorIndex }: StarterSectionProps) {
  const theme = CONTAINER_THEMES[colorIndex % CONTAINER_THEMES.length];

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-6 mb-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Accent strip */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accent} rounded-l-2xl`} />
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 ml-2">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${theme.iconBg} shadow-sm`}>
          <CollectionIcon name={collection.iconName} className={theme.iconColor} />
        </span>
        <div>
          <h3 className="font-heading text-lg font-bold text-zinc-800">{collection.name}</h3>
          <p className="text-xs text-slate-500">{collection.apps.length} starters</p>
        </div>
      </div>

      {/* Description */}
      {collection.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-4xl ml-[50px]">
          {collection.description}
        </p>
      )}

      {/* Horizontal scroll of seed cards */}
      <div className="scroll-container flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
        {collection.apps.map((seed) => (
          <div key={seed.id} className="shrink-0 w-[260px]">
            <SeedCard seed={seed} />
          </div>
        ))}
      </div>
    </div>
  );
}
