import { NextResponse } from "next/server";

type ApiBody = {
  success?: boolean;
  msgText?: string;
  message?: string;
  errorCode?: string | null;
  [key: string]: unknown;
};

export type ServiceResult<T = unknown> = {
  success: boolean;
  status: number;
  data?: T | null;
  msgText?: string;
  message?: string;
  errorCode?: string | null;
  count?: number;
  [key: string]: unknown;
};

const defaultMessages: Record<number, string> = {
  201: "Created successfully.",
  400: "Invalid request.",
  404: "Resource not found.",
  500: "Internal server error.",
};

function errorCodeForStatus(status: number) {
  if (status === 400) return "VALIDATION_ERROR";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 500) return "INTERNAL_SERVER_ERROR";
  return `HTTP_${status}`;
}

export function serviceSuccess<T>(status: number, message: string, data?: T, extra: Record<string, unknown> = {}): ServiceResult<T> {
  return { ...extra, success: true, status, message, msgText: message, errorCode: null, ...(data === undefined ? {} : { data }) };
}

export function serviceFailure<T = unknown>(message: string, status: number, errorCode?: string, data: T | null = null): ServiceResult<T> {
  return { success: false, status, message, msgText: message, errorCode: errorCode ?? errorCodeForStatus(status), data };
}

export function serviceError<T = unknown>(error: unknown, fallbackMessage = "Internal server error."): ServiceResult<T> {
  const errorCode = error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;

  if (errorCode === "PGRST301") {
    return serviceFailure(
      "Supabase authentication failed. Update SUPABASE_SERVICE_ROLE_KEY with the current project service role key.",
      503,
      "SUPABASE_AUTH_ERROR",
    );
  }

  if (errorCode === "PGRST205") {
    return serviceFailure(
      "The requested data table is missing. Apply the latest Supabase migration.",
      503,
      "DATABASE_SCHEMA_MISSING",
    );
  }

  return serviceFailure(fallbackMessage, 500, errorCode ?? "DATABASE_ERROR");
}

export function invalidInput<T = unknown>(message = "Invalid request.") {
  return serviceFailure<T>(message, 400, "VALIDATION_ERROR");
}

export function unauthorized(message = "Authentication is required.") {
  return serviceFailure(message, 401, "UNAUTHORIZED");
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export function hasValidApiToken(request: Request) {
  const expectedToken = process.env.API_AUTH_TOKEN;
  if (!expectedToken) return true;
  return getBearerToken(request) === expectedToken;
}

function normalizeBody(body: ApiBody, status: number): ApiBody {
  const success = body.success ?? status < 400;
  const message = body.message ?? body.msgText ?? (success ? "Request successful." : defaultMessages[status] ?? "Request failed.");

  return {
    ...body,
    success,
    msgText: message,
    message,
    errorCode: body.errorCode ?? (success ? null : errorCodeForStatus(status)),
  };
}

export function apiResponse(payload: unknown, init?: ResponseInit) {
  const requestedStatus = typeof init?.status === "number" ? init.status : undefined;
  const wrapper = payload as { data?: unknown } | null;
  const wrappedBody = wrapper?.data && typeof wrapper.data === "object"
    ? wrapper.data as ApiBody
    : null;
  const isLegacyWrapper = wrappedBody !== null &&
    ("success" in wrappedBody || "status" in wrappedBody || "msgText" in wrappedBody);
  const body = isLegacyWrapper ? wrappedBody : payload as ApiBody;
  const status = requestedStatus ?? (typeof body?.status === "number" ? body.status : 200);
  const { status: _status, ...responseBody } = body;

  return NextResponse.json(normalizeBody(responseBody, status), {
    ...init,
    status,
  });
}

export function errorResponse(error: unknown, status = 500, errorCode?: string) {
  const message = error instanceof Error ? error.message : "Internal server error.";

  return NextResponse.json({
    success: false,
    msgText: message,
    message,
    errorCode: errorCode ?? errorCodeForStatus(status),
    data: null,
  }, { status });
}

