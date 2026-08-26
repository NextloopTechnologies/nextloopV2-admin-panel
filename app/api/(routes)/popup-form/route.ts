import { NextRequest } from "next/server";
import { PopupFormService } from "../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page'))
    const pageSize = Number(req.nextUrl.searchParams.get('row'))
    const result = await PopupFormService.list(pageNo, pageSize);
    return apiResponse(result);
  } catch (error) {
    console.error("POPUP_FORM_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteIds = await req.json()
    const result = await PopupFormService.remove(deleteIds);
    return apiResponse(result);
  } catch (error) {
    console.error("POPUP_FORM_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}