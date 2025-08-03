import { writable } from 'svelte/store';
import { authStore } from './authStore';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
const API_URL = import.meta.env.VITE_API_URL;
function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  return {
    subscribe,
    set,
    update,

    removeItem(productId: string) {
      update((items) => items.filter((i) => i.productId !== productId));
    },

    async loadFromAPI() {
      const auth = localStorage.getItem('auth');
      if (!auth) return;

      const parsedAuth = JSON.parse(auth);
      const token = parsedAuth.token;
      const username = parsedAuth.user?.username;
      const res = await fetch(`${API_URL}/cart/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        console.error('Failed to load cart:', await res.text());
        return;
      }

      const data = await res.json();
      const cartItems = data.items;

      // 2️⃣ For each item, fetch product details by ID
      const detailedItems: CartItem[] = [];

      for (const cartItem of cartItems) {
        const productRes = await fetch(
          `${API_URL}/products/${cartItem.productId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!productRes.ok) {
          console.error(`Failed to load product ${cartItem.productId}`);
          continue;
        }

        const product = await productRes.json();

        detailedItems.push({
          productId: cartItem.productId,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity
        });
      }

      set(detailedItems);

    },

    async addToAPI(productId: string, quantity: number) {
      const auth = localStorage.getItem('auth');
      if (!auth) return;

      const parsedAuth = JSON.parse(auth);
      const token = parsedAuth.token;
      const username = parsedAuth.user?.username;
      const body = JSON.stringify({
        userId: username,
        productId,
        quantity
      });

      const res = await fetch(`${API_URL}/cart/${username}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (!res.ok) {
        console.error('Failed to add to cart API:', await res.text());
      }
    },

    async updateToAPI(productId: string, quantity: number) {
      const auth = localStorage.getItem('auth');
      if (!auth) return;

      const parsedAuth = JSON.parse(auth);
      const token = parsedAuth.token;
      const username = parsedAuth.user?.username;
      const body = JSON.stringify({
        userId: username,
        productId,
        quantity
      });

      const res = await fetch(`${API_URL}/cart/${username}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (!res.ok) {
        console.error('Failed to update to cart API:', await res.text());
      }
    },

    async clearAPI() {
      const auth = localStorage.getItem('auth');
      if (!auth) return;

      const parsedAuth = JSON.parse(auth);
      const token = parsedAuth.token;
      const username = parsedAuth.user?.username;

      await fetch(`${API_URL}/cart/${username}/clear`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      set([]);
    }
  };
}

export const cartStore = createCartStore();

