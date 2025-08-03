<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { authStore } from "$lib/stores/authStore";
    import { cartStore } from "$lib/stores/cartStore";
    import { get } from "svelte/store";
    import { toastStore } from "$lib/stores/toastStore";
    const API_URL = import.meta.env.VITE_API_URL;

    let product: Product | null = null;
    let added = false;

    interface Product {
        id: string;
        name: string;
        description: string;
        category: string;
        price: number;
        available: boolean;
        stock: number;
    }

    // Get the :id from the URL
    const id = $page.params.id;

    async function fetchProduct() {
        const auth = get(authStore);
        if (!auth.token) {
            console.error("No token");
            return;
        }

        const res = await fetch(`${API_URL}/products/${id}`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });

        if (!res.ok) {
            console.error("Failed to fetch product", res.status);
        }

        const productRes = await res.json();
        let productsWithStockStock;
        const inventoryRes = await fetch(
            `${API_URL}/inventory/${productRes.id}`,
            {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            },
        );
        if (inventoryRes.ok) {
            const inventoryData = await inventoryRes.json();
            productsWithStockStock = {
                ...productRes,
                stock: inventoryData.quantity,
            } as Product;
        } else {
            productsWithStockStock = {
                ...productRes,
                stock: 0, // fallback
            } as Product;
        }

        product = productsWithStockStock;
    }

    async function addToCart() {
        if (!product) return;

        const p = product; // ✅ Now p is 100% Product

        cartStore.update((items) => {
            const existing = items.find((i) => i.productId === p.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                items.push({
                    productId: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: 1,
                });
            }
            return items;
        });

        // ✅ Call API sync too
        await cartStore.addToAPI(p.id, 1);

        added = true;
        toastStore.add(`Added ${p.name} to cart`);
        setTimeout(() => (added = false), 1500);
    }

    onMount(fetchProduct);
</script>

{#if product}
    <div class="product-detail">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Category: {product.category}</p>
        <p>Price: ${product.price}</p>
        {#if product.stock === 0}
            <span class="stock-badge out">Out of Stock</span>
        {:else if product.stock <= 3}
            <span class="stock-badge low">Only {product.stock} left!</span>
        {:else}
            <span class="stock-badge in">In Stock</span>
        {/if}
        {#if product.stock > 0}
            <button class="add-to-cart" on:click={addToCart} disabled={added}>
                {#if added}✔️ Added!{:else}Add to Cart{/if}
            </button>
        {/if}
    </div>
{:else}
    <p>Loading...</p>
{/if}

<style>
    .product-detail {
        border: 1px solid #e5e7eb; /* gray-200 */
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 600px;
        margin: 2rem auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .product-detail h2 {
        margin-bottom: 0.5rem;
    }

    .product-detail p {
        margin: 0.5rem 0;
    }

    .product-detail .add-to-cart {
        display: inline-block;
        margin-top: 1rem;
        background: #4f46e5; /* Indigo 600 */
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
    }

    .product-detail .add-to-cart:hover {
        background: #4338ca; /* Indigo 700 */
        box-shadow: 0 2px 8px rgba(67, 56, 202, 0.3);
    }

    button:disabled {
        background: #e5e7eb; /* gray-200 */
        color: #9ca3af; /* gray-400 */
        cursor: not-allowed;
    }

    button:disabled:hover {
        box-shadow: none;
        background: #e5e7eb;
    }

    .stock-badge {
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 0.5rem;
    }

    .stock-badge.in {
        background: #d1fae5; /* green-100 */
        color: #065f46; /* green-800 */
    }

    .stock-badge.low {
        background: #fef3c7; /* yellow-100 */
        color: #92400e; /* yellow-800 */
    }

    .stock-badge.out {
        background: #fecaca; /* red-200 */
        color: #991b1b; /* red-800 */
    }
</style>
