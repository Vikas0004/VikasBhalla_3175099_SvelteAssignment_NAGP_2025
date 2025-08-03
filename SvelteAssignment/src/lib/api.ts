import { get } from 'svelte/store';
import { authStore } from '$lib/stores/authStore';

export async function fetchWithAuth(
    input: RequestInfo,
    init: RequestInit = {}
): Promise<Response> {
    const { token } = get(authStore);

    // Start with an empty object if init.headers is undefined
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers instanceof Headers
            ? Object.fromEntries(init.headers.entries())
            : init.headers as Record<string, string> | undefined),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
        ...init,
        headers,
    };

    return fetch(input, requestInit);
}
