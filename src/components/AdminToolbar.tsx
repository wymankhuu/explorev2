'use client';

import { Shield, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';
import type { App } from '@/lib/types';

interface AdminToolbarProps {
  apps: App[];
}

export default function AdminToolbar({ apps }: AdminToolbarProps) {
  const { isAdmin, logout } = useAdmin();

  if (!isAdmin) return null;

  const pinnedCount = apps.filter((a) => a.pinned).length;
  const missingCount = apps.filter((a) => !a.usage || !a.impact).length;

  return (
    <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 font-semibold text-amber-800">
            <Shield size={14} />
            Admin Mode
          </div>
          <span className="text-amber-600">
            {pinnedCount} pinned · {missingCount} missing content
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-200 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-300 transition-colors"
          >
            <LayoutDashboard size={12} />
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-md bg-white border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
          >
            <LogOut size={12} />
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
