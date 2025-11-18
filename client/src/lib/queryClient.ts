<<<<<<< HEAD
import { QueryClient } from '@tanstack/react-query';
=======
<<<<<<< HEAD
<<<<<<< HEAD
import { QueryClient, type QueryFunctionContext } from "@tanstack/react-query";

type Primitive = string | number | boolean | bigint;

type ApiRequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
  body?: unknown;
};

function isOptions(value: unknown): value is ApiRequestOptions {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return "signal" in candidate || "headers" in candidate || "body" in candidate;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiRequest(url: string, options?: ApiRequestOptions): Promise<any>;
export function apiRequest(url: string, body: unknown, options?: ApiRequestOptions): Promise<any>;
export function apiRequest(method: string, url: string, body?: unknown, options?: ApiRequestOptions): Promise<any>;
export function apiRequest(url: string, method: string, body?: unknown, options?: ApiRequestOptions): Promise<any>;
export async function apiRequest(...args: unknown[]): Promise<any> {
  if (!args.length) {
    throw new Error("apiRequest requires at least one argument");
  }

  if (typeof args[0] !== "string") {
    throw new Error("First argument to apiRequest must be a string");
  }

  let method: string;
  let url: string;
  let body: unknown;
  let options: ApiRequestOptions | undefined;

  const first = args[0];
  const second = args[1];
  const third = args[2];
  const fourth = args[3];

  if (
    typeof second === "string" &&
    (second.startsWith("/") || second.startsWith("http")) &&
    args.length >= 2
  ) {
    method = first.toUpperCase();
    url = second;
    body = third;
    options = fourth as ApiRequestOptions | undefined;
  } else if (typeof second === "string") {
    url = first;
    method = second.toUpperCase();
    body = third;
    options = fourth as ApiRequestOptions | undefined;
  } else {
    url = first;
    method = "GET";
    if (isOptions(second)) {
      options = second;
      body = third;
    } else {
      body = second;
      options = third as ApiRequestOptions | undefined;
    }
  }

  if (options && options.body !== undefined && body === undefined) {
    body = options.body;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  let fetchBody: BodyInit | undefined;

  if (body instanceof FormData) {
    fetchBody = body;
  } else if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  if (options?.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers[key] = value as string;
    }
  }

  const response = await fetch(url, {
    method,
    headers: method === "GET" ? { Accept: headers.Accept, ...(options?.headers || {}) } : headers,
    body: method === "GET" ? undefined : fetchBody,
    credentials: "include",
    signal: options?.signal,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasBody = response.status !== 204 && response.status !== 205;
  let data: unknown = null;

  if (hasBody) {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as Record<string, Primitive>).message)
        : response.statusText || "Request failed";
    throw new ApiError(response.status, message, data);
  }

  return data;
}

const defaultQueryFn = async ({ queryKey, signal }: QueryFunctionContext): Promise<any> => {
  const [resource, params] = queryKey as [string, unknown];

  if (typeof resource !== "string") {
    throw new Error("First query key entry must be a string endpoint");
  }

  let url = resource;

  if (params && typeof params === "object" && !Array.isArray(params)) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value === undefined || value === null) continue;
      searchParams.set(key, String(value));
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  return apiRequest(url, { signal });
};
=======
import { QueryClient } from '@tanstack/react-query';
>>>>>>> origin/codex/add-tests-for-queryclient-and-authutils
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
<<<<<<< HEAD
=======
<<<<<<< HEAD
      queryFn: defaultQueryFn,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
=======
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
>>>>>>> codex/implement-page-layouts-and-navigation
=======
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  url: string,
  method: string = 'GET',
  data?: unknown,
) {
  const options: RequestInit = {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  };
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new Error('API request failed');
    (error as any).status = res.status;
    throw error;
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
<<<<<<< HEAD
=======
>>>>>>> origin/codex/add-tests-for-queryclient-and-authutils
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
