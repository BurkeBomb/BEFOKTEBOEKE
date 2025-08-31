import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest(
  methodOrPath: string,
  pathOrMethod?: string,
  data?: any
) {
  let method = "GET";
  let path = "";

  if (pathOrMethod && (pathOrMethod.startsWith("/") || pathOrMethod.startsWith("http"))) {
    method = methodOrPath;
    path = pathOrMethod;
  } else {
    path = methodOrPath;
    method = pathOrMethod ?? "GET";
  }

  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  try {
    return await res.json();
  } catch {
    return undefined;
  }
}
