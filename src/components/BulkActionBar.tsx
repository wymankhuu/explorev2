'use client';

import { useState } from 'react';
import { Pin, PinOff, X } from 'lucide-react';
import type { App } from '@/lib/types';

interface BulkActionBarProps {
  selectedApps: App[];
  password: string;
  onClear: () => void;
  onComplete: (pinned: boolean, appIds: string[]) => void;
}

export default function BulkActionBar({ selectedApps, password, onClear, onComplete }: BulkActionBarProps) {
  const [status, setStatus] = useState<'idle' | 'pinning' | 'unpinning'>('idle');

  if (selectedApps.length === 0) return null;

  const handleBulkPin = async (pinned: boolean) => {
    setStatus(pinned ? 'pinning' : 'unpinning');
    try {
      for (const app of selectedApps) {
        await fetch('/api/admin-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password,
            appName: app.name,
            pinned,
            collectionName: app.tags[0] || '',
          }),
        });
      }
      onComplete(pinned, selectedApps.map((a) => a.id));
    } catch {
      alert('Bulk operation failed');
    } finally {
      setStatus('idle');
    }
  };

  const isWorking = status !== 'idle';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-amber-50 border border-amber-300 rounded-xl shadow-xl px-5 py-3 flex items-center gap-3">
      <span className="text-sm font-semibold text-amber-900">
        {selectedApps.length} selected
      </span>
      <div className="w-px h-5 bg-amber-200" />
      <button
        onClick={() => handleBulkPin(true)}
        disabled={isWorking}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        <Pin size={12} />
        {status === 'pinning' ? 'Pinning...' : 'Pin to Showcase'}
      </button>
      <button
        onClick={() => handleBulkPin(false)}
        disabled={isWorking}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
      >
        <PinOff size={12} />
        {status === 'unpinning' ? 'Unpinning...' : 'Unpin'}
      </button>
      <div className="w-px h-5 bg-amber-200" />
      <button
        onClick={onClear}
        disabled={isWorking}
        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50"
      >
        <X size={12} />
        Clear
      </button>
    </div>
  );
}
