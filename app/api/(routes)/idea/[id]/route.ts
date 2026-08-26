import { IdeaService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/idea/')[1]);
    const result = await IdeaService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("IDEA_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}