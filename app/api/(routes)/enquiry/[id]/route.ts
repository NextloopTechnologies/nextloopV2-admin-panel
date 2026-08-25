import { EnquiryService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/enquiry/')[1]);
    const result = await EnquiryService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("ENQUIRY_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}