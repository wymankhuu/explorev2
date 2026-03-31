'use client';

import Link from 'next/link';
import { Star, Building2, Heart, GraduationCap, School, Pin, AlertCircle, GripVertical } from 'lucide-react';
import type { App } from '@/lib/types';
import { shortDesc, getInitials, highlightSegments, generateCreatorSlug } from '@/lib/utils';

interface AppCardProps {
  app: App;
  onClick: () => void;
  compact?: boolean;
  starCount?: number;
  isStarred?: boolean;
  onToggleStar?: () => void;
  searchQuery?: string;
  isAdminMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: () => void;
  showDragHandle?: boolean;
}

function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;
  const segments = highlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-amber-200/70 text-inherit rounded-sm px-0.5">{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

/** Pick an org icon based on the org name */
function OrgBadge({ name }: { name: string }) {
  const lower = (name || '').toLowerCase();
  let Icon = Building2;
  if (lower.includes('school') || lower.includes('district') || lower.includes('kipp') || lower.includes('nyc')) {
    Icon = School;
  } else if (lower.includes('college') || lower.includes('university') || lower.includes('higher')) {
    Icon = GraduationCap;
  } else if (lower.includes('reinvention') || lower.includes('foundation') || lower.includes('community')) {
    Icon = Heart;
  }

  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      <Icon size={14} strokeWidth={1.8} />
      <span className="text-xs font-medium truncate">{name || 'Educator'}</span>
    </div>
  );
}

export default function AppCard({ app, onClick, compact, starCount = 0, isStarred = false, onToggleStar, searchQuery, isAdminMode = false, isSelected = false, onSelectToggle, showDragHandle = false }: AppCardProps) {
  const orgName = app.role || app.tags[0] || 'Educator';
  const initials = getInitials(app.creator || 'Unknown');
  const maxTags = 3;
  const visibleTags = app.tags.slice(0, maxTags);
  const extraCount = app.tags.length - maxTags;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      role="button"
      tabIndex={0}
      className={`group relative block cursor-pointer rounded-lg border-2 ${
        isAdminMode && isSelected ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-white'
      } shadow-md transition-shadow duration-300 hover:shadow-xl ${
        compact ? 'w-[280px]' : ''
      }`}
    >
      {/* Admin indicators */}
      {isAdminMode && (
        <>
          {/* Checkbox for bulk selection */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => { e.stopPropagation(); onSelectToggle?.(); }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-300 cursor-pointer"
            />
          </div>
          {/* Pin badge */}
          {app.pinned && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center" title="Pinned to showcase">
              <Pin size={10} />
            </div>
          )}
          {/* Warning dot for missing content */}
          {(!app.usage || !app.impact) && (
            <div className="absolute top-2 right-8 z-10 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center" title="Missing usage or impact">
              <AlertCircle size={10} />
            </div>
          )}
          {/* Drag handle */}
          {showDragHandle && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-6 z-10 cursor-grab text-slate-300 hover:text-slate-500">
              <GripVertical size={16} />
            </div>
          )}
        </>
      )}
      <div className={`flex flex-col ${compact ? 'min-h-[14rem] p-3.5' : 'min-h-[16rem] p-4'}`}>
        {/* Org badge */}
        <div className="mb-2">
          <OrgBadge name={orgName} />
        </div>

        {/* Creator + star row */}
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="truncate text-sm text-playlab-blue">
              {app.creator ? (
                <Link
                  href={`/creator/${generateCreatorSlug(app.creator)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  <Highlight text={app.creator} query={searchQuery} />
                </Link>
              ) : (
                <span>Unknown</span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar?.(); }}
            className="flex items-center gap-1 shrink-0 transition-colors"
            aria-label={isStarred ? 'Unstar this app' : 'Star this app'}
          >
            <Star
              size={16}
              strokeWidth={1.5}
              className={isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 group-hover:text-slate-400'}
            />
            {starCount > 0 && (
              <span className="text-xs text-slate-400">{starCount}</span>
            )}
          </button>
        </div>

        {/* Title */}
        <div className={`mb-2 shrink-0 truncate font-semibold text-playlab-blue ${compact ? 'text-sm' : 'text-lg'}`}>
          <Highlight text={app.name} query={searchQuery} />
        </div>

        {/* Description */}
        <div className="flex-grow overflow-hidden">
          <p className={`line-clamp-3 text-slate-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
            <Highlight text={shortDesc(app.description)} query={searchQuery} />
          </p>
        </div>

        {/* Tags — Playlab badge style */}
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium bg-slate-200 text-slate-700"
            >
              <Highlight text={tag} query={searchQuery} />
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-xs text-slate-400 font-medium ml-0.5">+{extraCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
