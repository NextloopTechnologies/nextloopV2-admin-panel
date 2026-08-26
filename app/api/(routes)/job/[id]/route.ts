import { JobService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/job/')[1]);
    const result = await JobService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("JOB_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}