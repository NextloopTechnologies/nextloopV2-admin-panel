import { TestimonialService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/testimonial/')[1]);
    const result = await TestimonialService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("TESTIMONIAL_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}