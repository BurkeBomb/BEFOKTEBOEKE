import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? "";

const KNOWN_HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiRequestInit = Omit<RequestInit, "body" | "method">;

type NormalizedRequest = {
  method: string;
  path: string;
  body: unknown;
  init?: ApiRequestInit;
};

function normalizeRequest(
  first: string,
  second?: string | unknown,
  third?: unknown,
  fourth?: ApiRequestInit,
): NormalizedRequest {
  let method: string;
  let path: string;
  let body: unknown;
  let init: ApiRequestInit | undefined;

  if (first.startsWith("/")) {
    path = first;

    if (typeof second === "string" && !second.startsWith("/")) {
      method = second;
      body = third;
      init = fourth;
    } else {
      method = "GET";
      body = second;
      init = third as ApiRequestInit | undefined;
    }
  } else {
    method = first;
    if (typeof second !== "string") {
      throw new Error("Path must be provided when calling apiRequest with method first");
    }
    path = second;
    body = third;
    init = fourth;
  }

  method = method.toUpperCase();
  if (!KNOWN_HTTP_METHODS.has(method)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return { method, path, body, init };
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return `${API_BASE_URL}${path}`;
}

function prepareBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer || body instanceof URLSearchParams) {
    return body as BodyInit;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function handleError(response: Response): Promise<never> {
  const contentType = response.headers.get("content-type");
  let data: unknown;

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (error) {
      data = await response.text();
    }
  } else {
    data = await response.text();
  }

  const message =
    (typeof data === "object" && data !== null && "message" in data && typeof (data as Record<string, unknown>).message === "string"
      ? (data as Record<string, unknown>).message
      : undefined) ?? response.statusText ?? "Request failed";

  throw new ApiError(message, response.status, data);
}

export async function apiRequest(
  first: string,
  second?: string | unknown,
  third?: unknown,
  fourth?: ApiRequestInit,
): Promise<Response> {
  const { method, path, body, init } = normalizeRequest(first, second, third, fourth);
  const url = buildUrl(path);
  const preparedBody = prepareBody(body);

  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (preparedBody !== undefined && !(preparedBody instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(url, {
    ...init,
    method,
    credentials: init?.credentials ?? "include",
    headers,
    body: preparedBody,
  });

  if (!response.ok) {
    await handleError(response);
  }

  return response;
}

function buildPathFromQueryKey(queryKey: readonly unknown[]): string {
  if (queryKey.length === 0) {
    throw new Error("Query key must not be empty");
  }

  const [base, extra] = queryKey;
  if (typeof base !== "string") {
    throw new Error("First query key entry must be a string path");
  }

  let path = base;

  if (typeof extra === "string" || typeof extra === "number") {
    path = `${base.replace(/\/$/, "")}/${extra}`;
  } else if (extra && typeof extra === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(extra as Record<string, unknown>).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      const separator = path.includes("?") ? "&" : "?";
      path = `${path}${separator}${queryString}`;
    }
  }

  return path;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const path = buildPathFromQueryKey(queryKey);
        const response = await apiRequest("GET", path);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }

        return await response.text();
      },
      retry: 1,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
