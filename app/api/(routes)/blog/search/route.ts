import { NextRequest } from "next/server";
import { BlogService } from "@/app/api";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get('q') || '';
    if (!query || query.trim().length < 2) {
      return Response.json({ data: [] }, { status: 200 });
    }
    const { status, ...data } = await BlogService.search(query);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("BLOG_SEARCH_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}
