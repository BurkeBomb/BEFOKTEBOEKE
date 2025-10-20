import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

type AuthUser = User | null;

export function useAuth() {
  const query = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/auth/user");
        const contentType = response.headers.get("content-type") ?? "";
        if (response.status === 204 || !contentType.includes("application/json")) {
          return null;
        }
        return (await response.json()) as User;
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          return null;
        }
        throw error;
      }
    },
    retry: 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return useMemo(
    () => ({
      user: query.data,
      isAuthenticated: Boolean(query.data),
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    }),
    [query.data, query.error, query.isError, query.isLoading, query.refetch],
  );
}
