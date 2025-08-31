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

  it('returns parsed json for application/json responses', async () => {
    const mockJson = { hello: 'world' };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: vi.fn().mockResolvedValue(mockJson),
      text: vi.fn(),
    });
    vi.stubGlobal('fetch', mockFetch as any);
    const data = await apiRequest('/test');
    expect(data).toEqual(mockJson);
  });

  it('returns text for non-json responses', async () => {
    const mockText = 'ok';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/plain' },
      json: vi.fn(),
      text: vi.fn().mockResolvedValue(mockText),
    });
    vi.stubGlobal('fetch', mockFetch as any);
    const data = await apiRequest('/test');
    expect(data).toBe(mockText);
  });
});
