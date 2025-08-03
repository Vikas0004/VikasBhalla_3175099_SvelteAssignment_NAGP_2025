<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    const API_URL = import.meta.env.VITE_API_URL;

    let products: Product[] = [];
    let filteredProducts: Product[] = [];

    let nameFilter = "";
    let categoryFilter = "";

    let currentPage = 1;
    let itemsPerPage = 4;

    let sortKey: keyof Product = "name";
    let sortAsc = true;

    interface Product {
        id: string;
        name: string;
        description: string;
        category: string;
        price: number;
        available: boolean;
        stock: number;
    }

    async function fetchProducts() {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            throw new Error("Not authenticated");
        }

        const { token } = JSON.parse(auth);
        const query = [];

        if (nameFilter) {
            query.push(`name=${encodeURIComponent(nameFilter)}`);
        }
        if (categoryFilter) {
            query.push(`category=${encodeURIComponent(categoryFilter)}`);
        }

        const url = `${API_URL}/products${query.length ? "?" + query.join("&") : ""}`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch products");
        }

        const productData = await res.json();

        // For each product, get stock
        const productsWithStock = await Promise.all(
            productData.map(async (product: Product) => {
                const inventoryRes = await fetch(
                    `${API_URL}/inventory/${product.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (inventoryRes.ok) {
                    const inventoryData = await inventoryRes.json();
                    return {
                        ...product,
                        stock: inventoryData.quantity,
                    } as Product;
                } else {
                    return {
                        ...product,
                        stock: 0, // fallback
                    } as Product;
                }
            }),
        );

        products = productsWithStock;
        applyFiltersAndSorting();
    }

    function handleSearch() {
        fetchProducts();
        currentPage = 1;
    }

    function resetFilters() {
        nameFilter = "";
        categoryFilter = "";
        fetchProducts();
        currentPage = 1;
    }

    function applyFiltersAndSorting() {
        filteredProducts = [...products];

        filteredProducts.sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (typeof valA === "string" && typeof valB === "string") {
                return sortAsc
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            if (typeof valA === "number" && typeof valB === "number") {
                return sortAsc ? valA - valB : valB - valA;
            }

            return 0;
        });
    }

    function changeSort(key: keyof Product) {
        if (sortKey === key) {
            sortAsc = !sortAsc; // toggle order
        } else {
            sortKey = key;
            sortAsc = true;
        }
        applyFiltersAndSorting();
    }

    function viewDetails(id: string) {
        goto(`/product/${id}`);
    }

    $: paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    $: totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    onMount(() => {
        fetchProducts();
    });
</script>

<div class="search-bar">
    <input type="text" placeholder="Search by name" bind:value={nameFilter} />
    <input
        type="text"
        placeholder="Search by category"
        bind:value={categoryFilter}
    />
    <button on:click={handleSearch}>Search</button>
    <button on:click={resetFilters}>Reset</button>
</div>

<div class="sorting">
    <p>Sort by:</p>
    <button on:click={() => changeSort("name")}>Name</button>
    <button on:click={() => changeSort("price")}>Price</button>
    <button on:click={() => changeSort("category")}>Category</button>
    <span>{sortAsc ? "▲" : "▼"}</span>
</div>

<div class="products">
    {#each paginatedProducts as product}
        <div class="product-card">
            <h3>{product.name}</h3>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            {#if product.stock === 0}
                <span class="stock-badge out">Out of Stock</span>
            {:else if product.stock <= 3}
                <span class="stock-badge low">Only {product.stock} left!</span>
            {:else}
                <span class="stock-badge in">In Stock</span>
            {/if}
            <a class="view-details" href={`/product/${product.id}`}
                >View Details</a
            >
        </div>
    {/each}
</div>

<div class="pagination">
    <button on:click={() => currentPage--} disabled={currentPage === 1}
        >Prev</button
    >
    <span>Page {currentPage} of {totalPages} </span>
    <button
        on:click={() => currentPage++}
        disabled={currentPage * itemsPerPage >= filteredProducts.length}
    >
        Next
    </button>
</div>

<!-- <style>
    .search-bar {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .sorting {
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    input {
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 8px;
    }

    button {
        padding: 0.5rem 1rem;
        font-weight: bold;
        border: none;
        background: #3ab795;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s ease;
    }

    button:hover {
        background: #31987c;
    }

    .products {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    /* .product-card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
    } */

    .product-card {
        display: block;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1rem;
        text-decoration: none; /* remove link underline */
        color: inherit; /* inherit text color */
        margin-bottom: 1rem;
        transition: box-shadow 0.2s ease;
    }

    .product-card:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .pagination {
        margin-top: 2rem;
        display: flex;
        flex-direction: row-reverse;
        gap: 1rem;
        align-items: center;
    }

    .stock-badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        margin-top: 0.5rem;
    }

    .stock-badge.in {
        background: #d4edda;
        color: #155724;
    }

    .stock-badge.low {
        background: #fff3cd;
        color: #856404;
    }

    .stock-badge.out {
        background: #f8d7da;
        color: #721c24;
    }

    .product-card .view-details {
        display: inline-block;
        margin-top: 0.5rem;
        background: #3ab795;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 4px;
        text-decoration: none;
    }

    .product-card .view-details:hover {
        opacity: 0.9;
    }
</style> -->
<style>
    .search-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1.5rem 0;
    }

    input {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border-radius: 6px;
        border: 1px solid #d1d5db; /* gray-300 */
        outline: none;
        transition: border 0.2s ease;
    }

    input:focus {
        border-color: #4f46e5; /* Indigo 600 */
    }

    button {
        padding: 0.5rem 1rem;
        font-weight: 500;
        border: none;
        background: #4f46e5; /* Indigo 600 */
        color: white;
        cursor: pointer;
        border-radius: 6px;
        transition:
            background 0.2s ease,
            box-shadow 0.2s ease;
    }

    button:hover {
        background: #4338ca; /* Indigo 700 */
        box-shadow: 0 2px 8px rgba(67, 56, 202, 0.3);
    }

    .sorting {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .products {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
    }

    .product-card {
        border: 1px solid #e5e7eb; /* gray-200 */
        border-radius: 8px;
        padding: 1rem;
        background: white;
        transition:
            box-shadow 0.2s ease,
            transform 0.2s ease;
    }

    .product-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
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

    .product-card .view-details {
        display: inline-block;
        margin-top: 0.75rem;
        background: #4f46e5; /* Indigo 600 */
        color: white;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s ease;
    }

    .product-card .view-details:hover {
        background: #4338ca; /* Indigo 700 */
    }

    .pagination {
        margin: 2rem 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
    }

    .pagination button:disabled {
        background: #e5e7eb; /* gray-200 */
        color: #9ca3af; /* gray-400 */
        cursor: not-allowed;
        box-shadow: none;
    }

    .pagination span {
        font-weight: 500;
        color: #374151; /* gray-700 */
    }
</style>
