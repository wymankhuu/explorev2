'use client';

import { useSyncExternalStore, useCallback } from 'react';

const ADMIN_MODE_KEY = 'explorev2-admin-mode';
const ADMIN_PWD_KEY = 'explorev2-admin-pwd';

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function notify() {
  listeners.forEach((cb) => cb());
}

function getIsAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_MODE_KEY) === 'true';
}

function getPassword(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_PWD_KEY) || '';
}

export function useAdmin() {
  const isAdmin = useSyncExternalStore(subscribe, getIsAdmin, () => false);
  const password = useSyncExternalStore(subscribe, getPassword, () => '');

  const login = useCallback((pwd: string) => {
    sessionStorage.setItem(ADMIN_MODE_KEY, 'true');
    sessionStorage.setItem(ADMIN_PWD_KEY, pwd);
    notify();
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_MODE_KEY);
    sessionStorage.removeItem(ADMIN_PWD_KEY);
    notify();
  }, []);

  return { isAdmin, password, login, logout };
}
