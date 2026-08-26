import { AuthorService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/author/')[1]);
    const result = await AuthorService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("AUTHOR_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}