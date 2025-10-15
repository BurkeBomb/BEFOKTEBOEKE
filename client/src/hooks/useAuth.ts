import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { apiRequest, ApiError } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

type UseAuthResult = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<User | null>;
};

export function useAuth(): UseAuthResult {
  const { data, error, isPending, refetch } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: ({ signal }) => apiRequest("/api/auth/user", { signal }),
    retry: false,
  });

  if (error) {
    if (isUnauthorizedError(error)) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        refetch: () => refetch().then(result => result.data ?? null),
      };
    }

    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error as ApiError,
      refetch: () => refetch().then(result => result.data ?? null),
    };
  }

  return {
    user: data ?? null,
    isAuthenticated: Boolean(data),
    isLoading: isPending,
    error: null,
    refetch: () => refetch().then(result => result.data ?? null),
  };
}
