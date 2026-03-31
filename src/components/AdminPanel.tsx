'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Unlock, PenLine, Save, Pin, PinOff } from 'lucide-react';
import type { App } from '@/lib/types';
import { useAdmin } from '@/hooks/useAdmin';

interface AdminPanelProps {
  app: App;
  onAppUpdated: (updatedFields: Partial<App>) => void;
}

function PasswordModal({
  onSuccess,
  onCancel,
}: {
  onSuccess: (pwd: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const submit = useCallback(() => {
    const pwd = value.trim();
    if (!pwd) {
      setError('Please enter a password');
      return;
    }
    onSuccess(pwd);
  }, [value, onSuccess]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={20} className="text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Admin Access</h3>
          <p className="text-sm text-slate-500 mt-1">Enter the password to edit apps</p>
        </div>
        <input
          ref={inputRef}
          type="password"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-2"
          placeholder="Password"
          autoComplete="off"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') onCancel();
          }}
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-1 py-2 text-sm text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Unlock size={14} />
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ app, onAppUpdated }: AdminPanelProps) {
  const { isAdmin, password: adminPassword, login } = useAdmin();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [creator, setCreator] = useState(app.creator || '');
  const [role, setRole] = useState(app.role || '');
  const [description, setDescription] = useState(app.description || '');
  const [usage, setUsage] = useState(app.usage || '');
  const [impact, setImpact] = useState(app.impact || '');
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Save to Database');
  const [pinning, setPinning] = useState(false);

  useEffect(() => {
    if (!isAdmin) setShowPwdModal(true);
  }, [isAdmin]);

  useEffect(() => {
    setCreator(app.creator || '');
    setRole(app.role || '');
    setDescription(app.description || '');
    setUsage(app.usage || '');
    setImpact(app.impact || '');
    setSaveLabel('Save to Database');
  }, [app.id, app.creator, app.role, app.description, app.usage, app.impact]);

  const handleAuth = (pwd: string) => {
    login(pwd);
    setShowPwdModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveLabel('Saving...');
    try {
      const res = await fetch('/api/admin-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          appName: app.name,
          creator: creator.trim(),
          role: role.trim(),
          description: description.trim(),
          usage: usage.trim(),
          impact: impact.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Save failed: ' + (data.error || 'Unknown error'));
        setSaveLabel('Save to Database');
        setSaving(false);
        return;
      }
      onAppUpdated({
        creator: creator.trim(),
        role: role.trim(),
        description: description.trim(),
        usage: usage.trim(),
        impact: impact.trim(),
      });
      setSaveLabel('Saved!');
      setTimeout(() => { setSaveLabel('Save to Database'); setSaving(false); }, 1000);
    } catch {
      alert('Save failed');
      setSaveLabel('Save to Database');
      setSaving(false);
    }
  };

  const handlePin = async () => {
    const newPinned = !app.pinned;
    setPinning(true);
    try {
      const res = await fetch('/api/admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          appName: app.name,
          pinned: newPinned,
          collectionName: app.tags[0] || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Pin failed: ' + (data.error || 'Unknown error'));
        setPinning(false);
        return;
      }
      onAppUpdated({ pinned: newPinned });
      setPinning(false);
    } catch {
      alert('Pin failed');
      setPinning(false);
    }
  };

  if (showPwdModal) {
    return <PasswordModal onSuccess={handleAuth} onCancel={() => setShowPwdModal(false)} />;
  }

  if (!isAdmin) return null;

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <PenLine size={14} />
        Edit App
      </div>

      <button
        onClick={handlePin}
        disabled={pinning}
        className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
          app.pinned
            ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
            : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
        }`}
      >
        {app.pinned ? <PinOff size={14} /> : <Pin size={14} />}
        {pinning
          ? app.pinned ? 'Unpinning...' : 'Pinning...'
          : app.pinned ? 'Unpin from Showcase' : 'Pin to Showcase'}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-amber-700 mb-1">Creator</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-700 mb-1">Role</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Teacher"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this app do?"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-700 mb-1">How It&apos;s Being Used</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          rows={3}
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-amber-700 mb-1">Impact</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
          rows={3}
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors text-sm"
      >
        <Save size={14} />
        {saveLabel}
      </button>
    </div>
  );
}
