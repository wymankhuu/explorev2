'use client';

import { useEffect, useRef } from 'react';

export default function FadeUpGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    const children = el.querySelectorAll('.fade-up');
    children.forEach((child, i) => {
      (child as HTMLElement).style.transitionDelay = `${Math.min(i * 50, 300)}ms`;
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
