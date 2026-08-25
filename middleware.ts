import { NextRequest } from "next/server";
import { errorResponse, hasValidApiToken } from "@/app/api/utils/response";

export function middleware(request: NextRequest) {
  if (!hasValidApiToken(request)) {
    return errorResponse(new Error("Invalid authentication token."), 401, "UNAUTHORIZED");
  }

  return;
}

export const config = {
  matcher: ["/api/:path*"],
};
