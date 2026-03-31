'use client';

import { ExternalLink, BookOpen } from 'lucide-react';
import { getInitials, stringToColor } from '@/lib/utils';

interface CultivatorApp {
  name: string;
  url: string;
  id: string;
}

export interface Cultivator {
  name: string;
  role: string;
  organization: string;
  about: string;
  usage: string;
  impact: string;
  blogLink?: string;
  headshotUrl?: string;
  month: string;
  apps: CultivatorApp[];
}

function CultivatorCard({ cultivator }: { cultivator: Cultivator }) {
  const initials = getInitials(cultivator.name);
  const avatarColor = stringToColor(cultivator.name);
  const roleOrg = [cultivator.role, cultivator.organization].filter(Boolean).join(' · ');

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          {cultivator.headshotUrl ? (
            <img
              src={cultivator.headshotUrl}
              alt={cultivator.name}
              className="w-16 h-16 rounded-full object-cover shadow-sm shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
          <div>
            <h2 className="font-heading text-lg font-bold text-zinc-800">{cultivator.name}</h2>
            {roleOrg && <p className="text-sm text-slate-500 mt-0.5">{roleOrg}</p>}
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium text-primary bg-blue-50 px-2.5 py-1 rounded-full">
          {cultivator.month}
        </span>
      </div>

      {/* About */}
      {cultivator.about && (
        <p className="text-sm text-slate-700 leading-relaxed mb-5 border-l-3 border-primary/20 pl-4 italic">
          {cultivator.about}
        </p>
      )}

      {/* Usage */}
      {cultivator.usage && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-4">
          <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mb-1.5">
            <BookOpen size={14} strokeWidth={1.8} />
            How They&apos;re Using Playlab
          </h3>
          <p className="text-sm text-emerald-600 leading-relaxed">{cultivator.usage}</p>
        </div>
      )}

      {/* Impact */}
      {cultivator.impact && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-5">
          <h3 className="text-sm font-semibold text-blue-700 mb-1.5">Impact</h3>
          <p className="text-sm text-blue-600 leading-relaxed">{cultivator.impact}</p>
        </div>
      )}

      {/* Apps */}
      {cultivator.apps.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Their Apps</h3>
          <div className="flex flex-col gap-1.5">
            {cultivator.apps.map((app) => (
              <a
                key={app.id}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors group"
              >
                <span className="text-sm font-medium text-playlab-blue truncate">{app.name}</span>
                <ExternalLink size={12} className="text-slate-400 group-hover:text-primary shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Blog link */}
      {cultivator.blogLink && (
        <a
          href={cultivator.blogLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Read their story →
        </a>
      )}
    </article>
  );
}

export default function CultivatorSection({ cultivators }: { cultivators: Cultivator[] }) {
  if (cultivators.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Spotlight banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-pink-500 p-8 sm:p-10 mb-8 text-white">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-3">
          Monthly Spotlight
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          {cultivators[0]?.month || 'Featured Cultivators'}
        </h2>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">
          Behind every app is a person with a story. Meet the educators, coaches, and leaders who are building tools that reflect the communities they serve.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-8">
        {cultivators.map((c) => (
          <CultivatorCard key={c.name} cultivator={c} />
        ))}
      </div>
    </div>
  );
}
