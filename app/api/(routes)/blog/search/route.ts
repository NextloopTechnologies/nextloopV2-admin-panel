import { NextRequest } from "next/server";
import { BlogService } from "@/app/api";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {

    const query = req.nextUrl.searchParams.get("q");

    if (query === null) {
      return apiResponse({ data: [] }, { status: 200 });
    }

    if (query.trim().length < 2) {
      return apiResponse(
        { msgText: "Search query must be at least 2 characters." },
        { status: 400 }
      );
    }
    const { status, ...data } = await BlogService.search(query);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("BLOG_SEARCH_CONTROLLER", error);
    return errorResponse(error);
  }
}
