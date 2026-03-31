'use client';

import { Grid2x2, Sprout, BarChart3, Globe } from 'lucide-react';

export type TabId = 'apps' | 'starters' | 'collections' | 'communities';

interface TabToggleProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Grid2x2 }[] = [
  { id: 'apps', label: 'Apps', icon: Grid2x2 },
  { id: 'starters', label: 'Starters', icon: Sprout },
  { id: 'collections', label: 'Collections', icon: BarChart3 },
  { id: 'communities', label: 'Communities', icon: Globe },
];

export default function TabToggle({ activeTab, onChange }: TabToggleProps) {
  return (
    <div className="inline-flex overflow-x-auto max-w-full rounded-full border-2 border-slate-200 bg-white p-1 shadow-sm scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-playlab-blue text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={14} className="shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
