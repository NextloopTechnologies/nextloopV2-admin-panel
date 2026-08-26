import { PopupFormService } from "../../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/popup-form/')[1]); 
    const result = await PopupFormService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("POPUP_FORM_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}