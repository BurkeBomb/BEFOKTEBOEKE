import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../queryClient';

describe('queryClient', () => {
  it('initializes a QueryClient instance', () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });
});

describe('apiRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error with status for non-ok responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => null },
      json: vi.fn(),
      text: vi.fn(),
    });
    vi.stubGlobal('fetch', mockFetch as any);
    await expect(apiRequest('/test')).rejects.toMatchObject({ status: 500 });
  });
});
