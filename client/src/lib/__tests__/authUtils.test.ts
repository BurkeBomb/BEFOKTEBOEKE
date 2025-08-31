import { describe, it, expect } from 'vitest';
import { isUnauthorizedError } from '../authUtils';

describe('isUnauthorizedError', () => {
  it('returns true for errors with status 401', () => {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    expect(isUnauthorizedError(err)).toBe(true);
  });

  it('returns false for other errors', () => {
    const err = new Error('Forbidden');
    (err as any).status = 403;
    expect(isUnauthorizedError(err)).toBe(false);
  });
});
