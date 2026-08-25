import { AppliedJobService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/applied_job/')[1]);
    const result = await AppliedJobService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("APPLIEDJOB_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}