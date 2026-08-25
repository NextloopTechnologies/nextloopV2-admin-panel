export type ApiResponse = {
  success?: boolean;
  data?: unknown;
  count?: number;
  message?: string;
  msgText?: string;
  errorCode?: string | null;
  [key: string]: unknown;
};

export async function fetchApi<T extends ApiResponse = ApiResponse>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: options?.cache ?? "no-store",
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  let body: T;
  try {
    body = await response.json() as T;
  } catch {
    body = { success: false, message: `Request failed (${response.status}).` } as T;
  }

  if (!response.ok && body.success !== false) {
    body = { ...body, success: false, message: body.message || body.msgText || `Request failed (${response.status}).` };
  }

  return body;
}

export function responseMessage(response: ApiResponse | null | undefined, fallback: string): string {
  if (response?.message || response?.msgText) {
    const message = response.message || response.msgText || fallback;
    return response.errorCode && response.success === false
      ? `${message} (${response.errorCode})`
      : message;
  }
  return fallback;
}

export function thrownErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
