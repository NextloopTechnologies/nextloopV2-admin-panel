import { CategoryService } from "@/app/api";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/category/')[1]);
    if (!Number.isInteger(id) || id <= 0) {
      return apiResponse(
        { msgText: "Invalid category id." },
        { status: 400 }
      );
    }
    const result = await CategoryService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("CATEGORY_READ_CONTROLLER", error);
    return errorResponse(error);
  }
}
