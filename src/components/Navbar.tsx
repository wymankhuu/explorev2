'use client';

import MobileNav from './MobileNav';

export default function Navbar() {
  return (
    <nav className="relative mx-auto max-w-screen-xl px-6 py-8 pb-4">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="https://playlab.ai" className="flex-none">
            <img src="/playlab-logo.png" alt="Playlab logo" className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden flex-1 justify-end gap-4 md:flex">
            <a href="https://playlab.ai/about" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 transition-colors">About us</a>
            <a href="https://learn.playlab.ai" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 transition-colors">Learn</a>
            <a href="https://luma.com/calendar/manage/cal-Ir2EI8RCEbMhOvK" className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 transition-colors">Events</a>
            <a href="https://mailchi.mp/mail/join-playlab" className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">Educator sign up</a>
          </div>
          <a href="https://playlab.ai/login" className="hidden md:block text-sm font-semibold leading-6 text-zinc-800">
            Log in <span aria-hidden="true">→</span>
          </a>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
