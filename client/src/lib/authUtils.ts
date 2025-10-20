import { ApiError } from "@/lib/queryClient";

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }

  if (error instanceof Error) {
    return /unauthorized/i.test(error.message);
  }

  return false;
}
