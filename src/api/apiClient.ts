const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
