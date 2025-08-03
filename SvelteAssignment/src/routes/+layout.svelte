<script lang="ts">
  import { authStore } from "$lib/stores/authStore";
  import { goto } from "$app/navigation";
  import { cartStore } from "$lib/stores/cartStore";
  import { toastStore } from "$lib/stores/toastStore";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  function logout() {
    authStore.clear();
    goto("/login");
  }

  $: cartCount = $cartStore.reduce((sum, item) => sum + item.quantity, 0);

  onMount(() => {
    cartStore.loadFromAPI();
  });
</script>

{#if $authStore.token}
  <nav class="navbar">
    <div class="left">
      Welcome, {$authStore.user?.username}!
      <a
        href="/"
        class="nav-button"
        class:active={$page.url.pathname === "/"}
      >
        🛍️ Products
      </a>
    </div>
    <div class="right">
      <a
        href="/cart"
        class="nav-button"
        class:active={$page.url.pathname === "/cart"}
      >
        🛒 {cartCount}
      </a>
      <a
        href="/orders"
        class="nav-button"
        class:active={$page.url.pathname === "/orders"}
      >
        📦 Orders
      </a>
      <button class="logout-button" on:click={logout}>🚪 Logout</button>
    </div>
  </nav>
{/if}

<slot />

<div class="toasts">
  {#each $toastStore as toast (toast.id)}
    <div class="toast">{toast.message}</div>
  {/each}
</div>

<style>
  .navbar {
    background-color: #4F46E5; /* Indigo 600 */
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    border-radius: 8px;
  }

  .left {
    font-size: 1.1rem;
    font-weight: 500;
  }

  .nav-button {
    display: inline-block;
    background-color: #6366F1; /* Indigo 500 */
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    margin-left: 1rem;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s, box-shadow 0.2s;
  }

  .nav-button:hover {
    background-color: #4F46E5; /* Darker Indigo on hover */
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  }

  .nav-button.active {
    background-color: #4338CA; /* Even darker when active */
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.2);
  }

  .logout-button {
    background: white;
    color: #4F46E5;
    border: none;
    padding: 0.5rem 1rem;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 1rem;
    transition: background 0.2s, color 0.2s;
  }

  .logout-button:hover {
    background: #EEF2FF; /* Light Indigo background on hover */
    color: #4338CA;
  }

  .toasts {
    position: fixed;
    top: 5rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 9999;
  }

  .toast {
    background: #111827; /* Dark Slate */
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
</style>
