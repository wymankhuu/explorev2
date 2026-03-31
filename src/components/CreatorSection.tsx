'use client';

import { ExternalLink, BookOpen, TrendingUp } from 'lucide-react';
import { getInitials, stringToColor } from '@/lib/utils';

interface CreatorApp {
  name: string;
  url: string;
  id: string;
}

export interface Creator {
  name: string;
  role: string;
  organization: string;
  about: string;
  usage: string;
  impact: string;
  blogLink?: string;
  headshotUrl?: string;
  month: string;
  apps: CreatorApp[];
}

function CreatorCard({ creator }: { creator: Creator }) {
  const initials = getInitials(creator.name);
  const avatarColor = stringToColor(creator.name);
  const roleOrg = [creator.role, creator.organization].filter(Boolean).join(' · ');

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: avatarColor }} />
      {/* Header */}
      <div className="px-6 sm:px-8 pt-5 pb-4" style={{ backgroundColor: `${avatarColor}08` }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {creator.headshotUrl ? (
              <img
                src={creator.headshotUrl}
                alt={creator.name}
                className="w-16 h-16 rounded-full object-cover shrink-0 ring-3 ring-white shadow-md"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ring-3 ring-white shadow-md"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
            )}
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900">{creator.name}</h2>
              {roleOrg && <p className="text-sm font-medium" style={{ color: avatarColor }}>{roleOrg}</p>}
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ color: avatarColor, borderColor: `${avatarColor}30`, backgroundColor: `${avatarColor}10` }}>
            {creator.month}
          </span>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-5">
        {/* About */}
        {creator.about && (
          <p className="text-[15px] text-slate-700 leading-relaxed">
            {creator.about}
          </p>
        )}

        {/* Usage */}
        {creator.usage && (
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <BookOpen size={12} strokeWidth={2} />
              How They&apos;re Using Playlab
            </h3>
            <p className="text-[15px] text-slate-700 leading-relaxed">{creator.usage}</p>
          </div>
        )}

        {/* Impact */}
        {creator.impact && (
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <TrendingUp size={12} strokeWidth={2} />
              Impact
            </h3>
            <p className="text-[15px] text-slate-700 leading-relaxed">{creator.impact}</p>
          </div>
        )}

        {/* Apps */}
        {creator.apps.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Their Apps</h3>
            <div className="flex flex-wrap gap-2">
              {creator.apps.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-sm font-medium text-playlab-blue transition-colors group"
                >
                  {app.name}
                  <ExternalLink size={11} className="opacity-50 group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Blog link */}
        {creator.blogLink && (
          <a
            href={creator.blogLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Read their story →
          </a>
        )}
      </div>
    </article>
  );
}

export default function CreatorSection({ creators }: { creators: Creator[] }) {
  if (creators.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Spotlight banner */}
      <div className="rounded-2xl bg-slate-900 p-8 sm:p-10 mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full mb-3">
          Monthly Spotlight
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
          {creators[0]?.month || 'Featured Creators'}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          Behind every app is a person with a story. Meet the educators, coaches, and leaders who are building tools that reflect the communities they serve.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-8">
        {creators.map((c) => (
          <CreatorCard key={c.name} creator={c} />
        ))}
      </div>
    </div>
  );
}
