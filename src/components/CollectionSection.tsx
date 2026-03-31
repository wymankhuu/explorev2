'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LinkIcon, QrCode, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { App, Collection } from '@/lib/types';
import AppCard from './AppCard';

interface CollectionSectionProps {
  collection: Collection;
  onAppClick: (app: App) => void;
  colorIndex: number;
  theme: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    accent: string;
  };
}

const MAX_PREVIEW = 9;

function CollectionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.FolderOpen;
  return <Icon size={20} strokeWidth={1.8} className={className} />;
}

function ShareButton({ collectionId }: { collectionId: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/collection/${collectionId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyLink}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white hover:text-slate-700 transition-colors"
    >
      {copied ? <Check size={12} className="text-green-600" /> : <LinkIcon size={12} />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}

export default function CollectionSection({ collection, onAppClick, theme }: CollectionSectionProps) {
  const previewApps = collection.apps.slice(0, MAX_PREVIEW);

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Accent strip */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.accent} rounded-l-2xl`} />
      {/* Header row — icon + title + View all */}
      <div className="flex items-start justify-between mb-2 ml-2">
        <h3 className="font-heading text-lg font-bold text-zinc-800 flex items-center gap-2.5">
          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${theme.iconBg} shadow-sm`}>
            <CollectionIcon name={collection.iconName} className={theme.iconColor} />
          </span>
          {collection.name}
          <span className="text-xs font-medium text-slate-400 ml-1">{collection.appCount}</span>
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton collectionId={collection.id} />
          <Link href={`/collection/${collection.id}`} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Description */}
      {collection.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-4xl ml-[50px]">
          {collection.description}
        </p>
      )}

      {/* Horizontal scroll of compact cards */}
      <div className="scroll-container flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
        {previewApps.map((app) => (
          <div key={app.id} className="shrink-0">
            <AppCard app={app} onClick={() => onAppClick(app)} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
