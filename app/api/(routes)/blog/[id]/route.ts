import { BlogService } from "@/app/api";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/blog/')[1]);
    const result = await BlogService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("BLOG_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}