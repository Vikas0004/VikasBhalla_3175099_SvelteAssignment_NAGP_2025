import { toastStore } from '$lib/stores/toastStore';
import type { LayoutLoad } from './$types';

const API_URL = import.meta.env.VITE_API_URL;

export const load: LayoutLoad = async ({ fetch }) => {
  if (typeof localStorage === 'undefined') return;

  const auth = localStorage.getItem('auth');
  if (!auth) {
    // Bad request? Treat as invalid.
    if (window.location.pathname !== '/login') {
      console.log(window.location.href);
      toastStore.add('Session expired, please login again.', 6000);
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return;
  }

  const { token } = JSON.parse(auth);

  if (!token && window.location.pathname !== '/login') {
    // Bad request? Treat as invalid.
    toastStore.add('Session expired, please login again.', 6000);
    localStorage.removeItem('auth');
    window.location.href = '/login';
    return;
  }

  const res = await fetch(`${API_URL}/user/validate?token=${token}`);

  if (!res.ok) {
    // Bad request? Treat as invalid.
    toastStore.add('Session expired, please login again.', 6000);
    localStorage.removeItem('auth');
    window.location.href = '/login';
    return;
  }

  const data = await res.json();

  if (data.error) {
    // Invalid token ➜ force logout
    localStorage.removeItem('auth');
    window.location.href = '/login';
  }
};
