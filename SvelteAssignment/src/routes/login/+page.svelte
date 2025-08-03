<script lang="ts">
    import { goto } from "$app/navigation";
    import { authStore } from "$lib/stores/authStore";
    const API_URL = import.meta.env.VITE_API_URL;

    let username = "";
    let password = "";
    let error = "";

    async function handleLogin(event: Event) {
        event.preventDefault();

        if (!username || !password) {
            error = "Username and password are required.";
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/user/login?username=${username}&password=${password}`,
                {
                    method: "POST",
                },
            );

            if (res.ok) {
                const data = await res.json();
                authStore.set({
                    token: data.token,
                    user: { username },
                });
                goto("/");
            } else {
                const data = await res.json();
                error = data.error || "Login failed.";
            }
        } catch (err) {
            console.error(err);
            error = "Request failed.";
        }
    }
</script>

<main class="login-page">
    <div class="login-card">
        <h1>Login</h1>
        <form on:submit={handleLogin}>
            <label>
                Username
                <input
                    type="text"
                    bind:value={username}
                    placeholder="Enter username"
                />
            </label>
            <label>
                Password
                <input
                    type="password"
                    bind:value={password}
                    placeholder="Enter password"
                />
            </label>

            {#if error}
                <p class="error">{error}</p>
            {/if}

            <button type="submit">Login</button>
        </form>
    </div>
</main>

<style>
    .login-page {
        background-color: #f9fafb;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .login-card {
        background: white;
        padding: 2rem 3rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 400px;
    }

    h1 {
        margin-bottom: 1.5rem;
        color: #4f46e5;
        text-align: center;
    }

    form {
        display: flex;
        flex-direction: column;
    }

    label {
        margin-bottom: 1rem;
        color: #374151;
        font-weight: 500;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        margin-top: 0.3rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 1rem;
    }

    input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    .error {
        color: #dc2626;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    button {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
    }

    button:hover {
        background: #4338ca;
    }
</style>
