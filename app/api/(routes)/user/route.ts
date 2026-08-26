import { NextRequest } from "next/server";
import { create, hashPassword, userExists, validateCredentials } from "../../services/user";
import { apiResponse, errorResponse, invalidInput } from "@/app/api/utils/response";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (payload?.username !== undefined) {
      if (!payload.username?.trim() || !payload.password) return apiResponse(invalidInput("Username and password are required."));
      const valid = await validateCredentials(payload);
      return apiResponse(valid
        ? { success: true, message: "Login successful." }
        : { success: false, message: "Invalid credentials.", errorCode: "INVALID_CREDENTIALS" }, { status: valid ? 200 : 401 });
    }

    if (!payload?.name?.trim() || !payload?.email?.trim() || !payload?.password) return apiResponse(invalidInput("Name, email, and password are required."));
    if (await userExists(payload.email)) return apiResponse({ success: false, message: "Email already taken.", errorCode: "DUPLICATE_EMAIL" }, { status: 409 });
    return apiResponse(await create({ ...payload, password: await hashPassword(payload.password) }));
  } catch (error) {
    console.error("USER_CONTROLLER", error);
    return errorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const row = Number(req.nextUrl.searchParams.get("row") ?? 10);
    const result = await import("../../services/user").then(service => service.list(page, row));
    return apiResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const ids = await req.json();
    const result = await import("../../services/user").then(service => service.remove(ids));
    return apiResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}