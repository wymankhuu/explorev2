'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About us', href: 'https://playlab.ai/about' },
  { label: 'Learn', href: 'https://learn.playlab.ai' },
  { label: 'Events', href: 'https://luma.com/calendar/manage/cal-Ir2EI8RCEbMhOvK' },
  { label: 'Educator sign up', href: 'https://mailchi.mp/mail/join-playlab', primary: true },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={20} className="text-zinc-800" /> : <Menu size={20} className="text-zinc-800" />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 px-6 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={
                link.primary
                  ? 'rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white text-center hover:bg-zinc-800 transition-colors'
                  : 'rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-slate-50 transition-colors'
              }
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://playlab.ai/login"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-slate-50 transition-colors"
          >
            Log in →
          </a>
        </div>
      )}
    </div>
  );
}
