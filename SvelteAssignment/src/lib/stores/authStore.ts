import { writable } from 'svelte/store';

export interface Auth {
  token: string | null;
  user: { username: string } | null;
}

function createAuthStore() {
  const localData = typeof localStorage !== 'undefined' ? localStorage.getItem('auth') : null;
  const initial: Auth = localData ? JSON.parse(localData) : { token: null, user: null };
  const { subscribe, set, update } = writable<Auth>(initial);

  return {
    subscribe,
    set: (value: Auth) => {
      localStorage.setItem('auth', JSON.stringify(value));
      set(value);
    },
    clear: () => {
      localStorage.removeItem('auth');
      set({ token: null, user: null });
    }
  };
}

export const authStore = createAuthStore();
