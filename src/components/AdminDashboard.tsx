'use client';

import { useState, useMemo, useEffect } from 'react';
import { Shield, Database, CheckCircle2, AlertTriangle, Star, Lock, Unlock, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';
import type { App, Collection } from '@/lib/types';

// ─── Password Gate ────────────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: (pwd: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    const pwd = value.trim();
    if (!pwd) { setError('Enter a password'); return; }
    setChecking(true);
    // Validate password by making a lightweight admin call
    const res = await fetch('/api/admin-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, appName: '__ping__' }),
    });
    setChecking(false);
    if (res.status === 401) {
      setError('Invalid password');
      return;
    }
    // 404 (app not found) or 200 means password was valid
    onSuccess(pwd);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Enter the admin password to continue</p>
        </div>
        <input
          type="password"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 mb-2"
          placeholder="Password"
          autoComplete="off"
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <button
          onClick={submit}
          disabled={checking}
          className="w-full py-2.5 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Unlock size={14} />
          {checking ? 'Checking...' : 'Enter'}
        </button>
      </div>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Database;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function completenessLevel(app: App): 'complete' | 'partial' | 'missing' {
  const has = [app.description, app.usage, app.impact].filter(Boolean).length;
  if (has === 3) return 'complete';
  if (has === 0) return 'missing';
  return 'partial';
}

function HealthDot({ filled }: { filled: boolean }) {
  return (
    <div className={`w-2.5 h-2.5 rounded-full ${filled ? 'bg-green-500' : 'bg-red-300'}`} />
  );
}

// ─── Inline Editor ────────────────────────────────────────────────
function InlineEditor({ app, password, onSaved }: { app: App; password: string; onSaved: (fields: Partial<App>) => void }) {
  const [creator, setCreator] = useState(app.creator || '');
  const [role, setRole] = useState(app.role || '');
  const [description, setDescription] = useState(app.description || '');
  const [usage, setUsage] = useState(app.usage || '');
  const [impact, setImpact] = useState(app.impact || '');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (field: 'usage' | 'impact') => {
    setGenerating(field);
    try {
      const res = await fetch('/api/admin-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, appName: app.name, description: description || app.description, field }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Generate failed: ' + (data.error || 'Unknown'));
        return;
      }
      if (field === 'usage') setUsage(data.text);
      if (field === 'impact') setImpact(data.text);
    } catch {
      alert('Generate failed');
    } finally {
      setGenerating(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          appName: app.name,
          creator: creator.trim(),
          role: role.trim(),
          description: description.trim(),
          usage: usage.trim(),
          impact: impact.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert('Save failed: ' + (data.error || 'Unknown'));
        return;
      }
      onSaved({
        creator: creator.trim(),
        role: role.trim(),
        description: description.trim(),
        usage: usage.trim(),
        impact: impact.trim(),
      });
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-amber-50/50 border-t border-amber-100 px-4 py-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-amber-700 mb-0.5">Creator</label>
          <input type="text" className="w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" value={creator} onChange={(e) => setCreator(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-700 mb-0.5">Role</label>
          <input type="text" className="w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-amber-700 mb-0.5">Description</label>
        <textarea className="w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-xs font-medium text-amber-700">How It&apos;s Being Used</label>
          {!usage && (
            <button
              onClick={() => handleGenerate('usage')}
              disabled={generating !== null}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50"
            >
              <Sparkles size={10} />
              {generating === 'usage' ? 'Generating...' : 'Auto-generate'}
            </button>
          )}
        </div>
        <textarea className="w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" rows={2} value={usage} onChange={(e) => setUsage(e.target.value)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-xs font-medium text-amber-700">Impact</label>
          {!impact && (
            <button
              onClick={() => handleGenerate('impact')}
              disabled={generating !== null}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50"
            >
              <Sparkles size={10} />
              {generating === 'impact' ? 'Generating...' : 'Auto-generate'}
            </button>
          )}
        </div>
        <textarea className="w-full px-2.5 py-1.5 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" rows={2} value={impact} onChange={(e) => setImpact(e.target.value)} />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save to Database'}
      </button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
interface AdminDashboardProps {
  apps: App[];
  collections: Collection[];
}

type SortKey = 'name' | 'creator' | 'completeness' | 'pinned' | 'stars';
type SortDir = 'asc' | 'desc';

export default function AdminDashboard({ apps: initialApps, collections }: AdminDashboardProps) {
  const { isAdmin, password, login } = useAdmin();
  const [apps, setApps] = useState(initialApps);
  const [starCounts, setStarCounts] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('completeness');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterCollection, setFilterCollection] = useState<string>('');
  const [search, setSearch] = useState('');

  // Fetch star counts
  useEffect(() => {
    if (!isAdmin) return;
    const ids = apps.map((a) => a.id).slice(0, 100).join(',');
    if (!ids) return;
    fetch(`/api/stars?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => setStarCounts(data))
      .catch(() => {});
  }, [isAdmin, apps]);

  if (!isAdmin) {
    return <PasswordGate onSuccess={login} />;
  }

  // Stats
  const totalApps = apps.length;
  const completeApps = apps.filter((a) => a.description && a.usage && a.impact).length;
  const missingApps = totalApps - completeApps;
  const totalStars = Object.values(starCounts).reduce((sum, n) => sum + n, 0);

  // Filter + search
  let filtered = apps;
  if (filterCollection) {
    filtered = filtered.filter((a) => a.tags.includes(filterCollection));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((a) =>
      a.name.toLowerCase().includes(q) || a.creator.toLowerCase().includes(q)
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'creator': cmp = a.creator.localeCompare(b.creator); break;
      case 'completeness': {
        const order = { complete: 2, partial: 1, missing: 0 };
        cmp = order[completenessLevel(a)] - order[completenessLevel(b)];
        break;
      }
      case 'pinned': cmp = (a.pinned ? 1 : 0) - (b.pinned ? 1 : 0); break;
      case 'stars': cmp = (starCounts[a.id] || 0) - (starCounts[b.id] || 0); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleAppSaved = (appId: string, fields: Partial<App>) => {
    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, ...fields } : a));
    setExpandedId(null);
  };

  const collectionNames = [...new Set(apps.flatMap((a) => a.tags))].sort();

  const exportCsv = () => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = 'Name,Creator,Role,Collection,Description,Usage,Impact,Pinned,Stars';
    const rows = sorted.map((a) =>
      [a.name, a.creator, a.role, a.tags[0] || '', a.description, a.usage, a.impact, a.pinned ? 'Yes' : 'No', starCounts[a.id] || 0]
        .map((v) => escape(String(v)))
        .join(',')
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explore-apps-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
      onClick={() => toggleSort(sortKeyName)}
    >
      {label} {sortKey === sortKeyName ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  const rowColor = (app: App) => {
    const level = completenessLevel(app);
    if (level === 'complete') return 'bg-green-50/50';
    if (level === 'missing') return 'bg-red-50/50';
    return 'bg-amber-50/50';
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Shield size={20} className="text-amber-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Manage showcase apps and content</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            &larr; Back to Explore
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Database} label="Total Apps" value={totalApps} color="bg-blue-500" />
          <StatCard icon={CheckCircle2} label="Complete Content" value={completeApps} color="bg-green-500" />
          <StatCard icon={AlertTriangle} label="Missing Content" value={missingApps} color="bg-amber-500" />
          <StatCard icon={Star} label="Total Stars" value={totalStars} color="bg-purple-500" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 w-64"
          />
          <select
            value={filterCollection}
            onChange={(e) => setFilterCollection(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <option value="">All collections</option>
            {collectionNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400">{sorted.length} apps</span>
          <div className="ml-auto">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={12} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Health Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortHeader label="App Name" sortKeyName="name" />
                <SortHeader label="Creator" sortKeyName="creator" />
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Collection</th>
                <SortHeader label="Content" sortKeyName="completeness" />
                <SortHeader label="Pinned" sortKeyName="pinned" />
                <SortHeader label="Stars" sortKeyName="stars" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((app) => (
                <tr key={app.id} className="group">
                  <td colSpan={6} className="p-0">
                    <div
                      className={`grid grid-cols-[1fr_1fr_1fr_auto_auto_auto] items-center cursor-pointer hover:bg-slate-50 transition-colors ${rowColor(app)} ${expandedId === app.id ? 'bg-amber-50' : ''}`}
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <div className="px-3 py-2.5 text-sm font-medium text-slate-900 truncate max-w-[200px]">{app.name}</div>
                      <div className="px-3 py-2.5 text-sm text-slate-600 truncate">{app.creator || '\u2014'}</div>
                      <div className="px-3 py-2.5 text-xs text-slate-500 truncate">{app.tags[0] || '\u2014'}</div>
                      <div className="px-3 py-2.5 flex items-center gap-1" title={`Desc: ${app.description ? 'yes' : 'no'}, Usage: ${app.usage ? 'yes' : 'no'}, Impact: ${app.impact ? 'yes' : 'no'}`}>
                        <HealthDot filled={!!app.description} />
                        <HealthDot filled={!!app.usage} />
                        <HealthDot filled={!!app.impact} />
                      </div>
                      <div className="px-3 py-2.5 text-xs text-slate-500">{app.pinned ? '\ud83d\udccc' : '\u2014'}</div>
                      <div className="px-3 py-2.5 text-xs text-slate-500">{starCounts[app.id] || 0}</div>
                    </div>
                    {expandedId === app.id && (
                      <InlineEditor
                        app={app}
                        password={password}
                        onSaved={(fields) => handleAppSaved(app.id, fields)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-500">
              No apps match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
