import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: unknown,
) {
  const options: RequestInit = {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  };
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error('API request failed');
    (error as any).status = res.status;
    throw error;
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
