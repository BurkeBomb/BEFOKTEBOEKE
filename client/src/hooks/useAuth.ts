import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"),
  });

  return {
    user: data,
    isAuthenticated: !!data,
    isLoading,
  };
}
