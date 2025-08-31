export function isUnauthorizedError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (err.status === 401) return true;
    const message = typeof err.message === 'string' ? err.message : '';
    if (message.toLowerCase().includes('unauthorized')) return true;
  }
  return false;
}
