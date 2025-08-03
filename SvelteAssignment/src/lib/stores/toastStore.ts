import { writable } from 'svelte/store';

export interface Toast {
  id: number;
  message: string;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function add(message: string, duration = 3000) {
    const id = Date.now();
    update(toasts => [...toasts, { id, message }]);
    setTimeout(() => {
      update(toasts => toasts.filter(t => t.id !== id));
    }, duration);
  }

  return { subscribe, add };
}

export const toastStore = createToastStore();
