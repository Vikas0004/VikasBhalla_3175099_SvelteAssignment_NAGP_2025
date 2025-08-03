<script lang="ts">
    import { onMount } from "svelte";
    import { cartStore, type CartItem } from "$lib/stores/cartStore";
    import { toastStore } from "$lib/stores/toastStore";
    const API_URL = import.meta.env.VITE_API_URL;

    let cart: CartItem[] = [];
    let total = 0;
    let showModal = false;
    let orderSuccessfull = false;
    let modalMessage = "";

    const unsubscribe = cartStore.subscribe((value) => {
        cart = value;
        total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    });

    onMount(() => {
        cartStore.loadFromAPI();
    });

    function clearCart() {
        if (confirm("Are you sure you want to clear your cart?")) {
            cartStore.clearAPI();
        }
    }

    function updateQuantity(item: CartItem, delta: number) {
        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) {
            toastStore.add(`Removed ${item.name} from cart`);
            cartStore.removeItem(item.productId);
        } else {
            cartStore.update((items) => {
                const target = items.find(
                    (i) => i.productId === item.productId,
                );
                if (target) {
                    target.quantity = newQuantity;
                }
                return items;
            });
            toastStore.add(`Cart Updated !!`);
        }

        // Sync to backend
        cartStore.updateToAPI(item.productId, newQuantity);
    }

    async function placeOrder() {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            modalMessage = "❌ You are not logged in!";
            showModal = true;
            return;
        }

        const parsedAuth = JSON.parse(auth);
        const username = parsedAuth.user?.username;
        const token = parsedAuth.token;

        if (!username || !token) {
            modalMessage = "❌ Session expired. Please login again.";
            showModal = true;
            return;
        }

        try {
            const res = await fetch(`${API_URL}/orders/place`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: username }),
            });

            const data = await res.json();

            if (res.ok) {
                modalMessage = `✅ ${data.message}`;
                orderSuccessfull = true;
                cartStore.clearAPI();
            } else if (res.status === 409) {
                // Extract product IDs from the message
                const matches = data.message.match(/\d+/g);
                let friendlyMessage = data.message;

                if (matches && matches.length) {
                    const productNames = [];

                    for (const id of matches) {
                        const prodRes = await fetch(
                            `${API_URL}/products/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        );

                        if (prodRes.ok) {
                            const prodData = await prodRes.json();
                            productNames.push(prodData.name);
                        } else {
                            productNames.push(`Product ${id}`);
                        }
                    }

                    friendlyMessage = `❌ Order failed: Not enough stock for ${productNames.join(", ")}`;
                }

                modalMessage = friendlyMessage;
            } else if (res.status === 402) {
                modalMessage = `❌ ${data.message}`;
            } else if (res.status === 503) {
                modalMessage = `❌ ${data.message}`;
            } else {
                modalMessage = `❌ Unknown error: ${res.status}`;
            }

            showModal = true;
        } catch (err) {
            modalMessage = "❌ Failed to place order. Please try again.";
            showModal = true;
            console.error(err);
        }
    }
</script>

<h1>Your Cart</h1>

<div class="cart-container">
    {#if cart.length === 0}
        <p>Your cart is empty.</p>
    {:else}
        <ul>
            {#each cart as item}
                <li>
                    <div class="item-info">
                        <strong>{item.name}</strong><br />
                        ${item.price} × {item.quantity}
                    </div>
                    <div class="item-controls">
                        <button on:click={() => updateQuantity(item, -1)}
                            >-</button
                        >
                        <button on:click={() => updateQuantity(item, 1)}
                            >+</button
                        >
                    </div>
                </li>
            {/each}
        </ul>

        <p class="subtotal"><strong>Subtotal:</strong> ${total.toFixed(2)}</p>

        <button class="place-order-btn" on:click={placeOrder}
            >Place Order</button
        >
        <button class="clear-btn" on:click={clearCart}>Clear Cart</button>
    {/if}
    {#if showModal}
        <div class="modal-overlay">
            <div class="modal-content">
                <p>{modalMessage}</p>
                {#if orderSuccessfull}<button
                        on:click={() => (window.location.href = "/orders")}
                        >Go To Orders!</button
                    >
                {/if}
                <button on:click={() => (showModal = false)}>Close</button>
            </div>
        </div>
    {/if}
</div>

<!-- <style>

    .cart-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
        background: #f9f9f9;
    }

    .item-info {
        flex: 1;
    }

    .item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    button {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 4px;
        background: #3ab795;
        color: #fff;
        font-weight: bold;
    }

    button:hover {
        cursor: pointer;
        opacity: 0.9;
    }

    .clear-btn,
    .place-order-btn {
        margin-top: 1rem;
        padding: 0.6rem 1.2rem;
        background: #333;
    }

    .clear-btn {
        background: #c0392b;
    }

    .subtotal {
        text-align: right;
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    .back-button {
        display: inline-block;
        margin-bottom: 1rem;
        margin-top: 1rem;
        margin-left: 2rem;
        text-decoration: none;
        color: #3ab795;
        font-weight: bold;
    }

    .back-button:hover {
        text-decoration: underline;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .modal-content {
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
    }

    .modal-content button {
        margin-top: 1rem;
        background: #3ab795;
        color: white;
        border: none;
        padding: 0.5rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
    }

    .modal-content button:hover {
        background: #319e81;
    }
</style> -->

<style>
    .cart-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
        background: #f9f9f9;
    }

    .item-info {
        flex: 1;
    }

    .item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    button {
        font-size: 1rem;
        padding: 0.6rem 1.2rem; /* ✅ Unified size */
        border: none;
        border-radius: 6px;
        background: #4f46e5;
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    button:hover {
        opacity: 0.9;
    }

    .place-order-btn,
    .clear-btn {
        margin-top: 1rem;
        min-width: 160px; /* ✅ Makes them equal width */
        text-align: center;
    }

    .place-order-btn {
        background: #4f46e5;
    }

    .clear-btn {
        background: #c0392b;
    }

    .clear-btn:hover {
        background: #a93226;
    }

    .subtotal {
        text-align: right;
        margin-top: 1rem;
        font-size: 1.2rem;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }

    .modal-content {
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
    }

    .modal-content button {
        margin-top: 1rem;
        background: #4f46e5;
        color: white;
        border: none;
        padding: 0.6rem 1.2rem; /* ✅ Same size in modal too */
        border-radius: 6px;
        cursor: pointer;
    }

    .modal-content button:hover {
        background: #4338ca;
    }
</style>
