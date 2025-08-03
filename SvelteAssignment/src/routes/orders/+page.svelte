<script lang="ts">
    import { onMount } from "svelte";
    import { toastStore } from "$lib/stores/toastStore";
    const API_URL = import.meta.env.VITE_API_URL;

    type OrderItem = {
        productId: string;
        quantity: number;
        name?: string;
        price?: number;
    };

    type Order = {
        orderNumber: string;
        items: OrderItem[];
        orderTotal: number;
    };

    let orders: Order[] = [];
    let loading = true;

    onMount(async () => {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            toastStore.add("Not authenticated!");
            loading = false;
            return;
        }

        const { user, token } = JSON.parse(auth);
        if (!user || !token) {
            toastStore.add("Auth info missing!");
            loading = false;
            return;
        }

        try {
            // 1️⃣ Fetch Orders
            const res = await fetch(`${API_URL}/orders/get/${user.username}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                toastStore.add(`Failed to fetch orders (${res.status})`);
                loading = false;
                return;
            }

            const data = await res.json();
            orders = data.orders || [];

            // 2️⃣ Resolve Product Names & Prices
            for (const order of orders) {
                for (const item of order.items) {
                    try {
                        const prodRes = await fetch(
                            `${API_URL}/products/${item.productId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        );

                        if (prodRes.ok) {
                            const prodData = await prodRes.json();
                            item.name = prodData.name;
                            item.price = prodData.price;
                        } else {
                            item.name = `Product ${item.productId}`;
                        }
                    } catch (err) {
                        console.error(err);
                        item.name = `Product ${item.productId}`;
                    }
                }
            }
        } catch (err) {
            toastStore.add("Error fetching orders");
            console.error(err);
        } finally {
            loading = false;
        }
    });
</script>

<h1>Your Orders</h1>

{#if loading}
    <p class="loading">Loading your orders...</p>
{:else if orders.length === 0}
    <p class="empty">You have no orders yet.</p>
{:else}
    <div class="orders">
        {#each orders as order}
            <div class="order-card">
                <h2>📦 Order #: {order.orderNumber}</h2>
                <ul class="order-items">
                    {#each order.items as item}
                        <li>
                            <span class="item-name">{item.name}</span>
                            <span class="item-details"
                                >Qty: {item.quantity}</span
                            >
                            <span class="item-price">
                                ${item.price
                                    ? (item.price * item.quantity).toFixed(2)
                                    : ""}
                            </span>
                        </li>
                    {/each}
                </ul>
                <p class="total">
                    Total: <strong>${order.orderTotal.toFixed(2)}</strong>
                </p>
            </div>
        {/each}
    </div>
{/if}

<!-- <style>
    h1 {
        text-align: center;
        color: #3ab795; /* Keppel brand */
        margin-top: 2rem;
    }

    .loading,
    .empty {
        text-align: center;
        margin-top: 2rem;
        color: #555;
    }

    .orders {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .order-card {
        border: 2px solid #3ab795;
        border-radius: 8px;
        padding: 1rem 1.5rem;
        background: #f9f9f9;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .order-card h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #333;
    }

    .order-items {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .order-items li {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #eee;
        padding: 0.5rem 0;
    }

    .item-name {
        flex: 2;
        font-weight: 500;
    }

    .item-details {
        flex: 1;
        text-align: center;
        color: #555;
    }

    .item-price {
        flex: 1;
        text-align: right;
        font-weight: 500;
    }

    .total {
        text-align: right;
        margin-top: 1rem;
        font-size: 1rem;
        color: #333;
    }
</style> -->

<style>
    h1 {
        text-align: center;
        color: #3f51b5; /* Indigo 500 */
        margin-top: 2rem;
    }

    .loading,
    .empty {
        text-align: center;
        margin-top: 2rem;
        color: #555;
    }

    .orders {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .order-card {
        border: 2px solid #3f51b5; /* Indigo border */
        border-radius: 8px;
        padding: 1rem 1.5rem;
        background: #f3f4f6; /* Light gray background */
        box-shadow: 0 4px 12px rgba(63, 81, 181, 0.1); /* Indigo tint */
        transition: box-shadow 0.2s ease;
    }

    .order-card:hover {
        box-shadow: 0 6px 16px rgba(63, 81, 181, 0.15);
    }

    .order-card h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #1a237e; /* Indigo 900 */
    }

    .order-items {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .order-items li {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
        padding: 0.5rem 0;
    }

    .item-name {
        flex: 2;
        font-weight: 500;
        color: #3f51b5;
    }

    .item-details {
        flex: 1;
        text-align: center;
        color: #555;
    }

    .item-price {
        flex: 1;
        text-align: right;
        font-weight: 500;
        color: #1a237e; /* Dark indigo */
    }

    .total {
        text-align: right;
        margin-top: 1rem;
        font-size: 1rem;
        color: #1a237e;
        font-weight: bold;
    }
</style>
