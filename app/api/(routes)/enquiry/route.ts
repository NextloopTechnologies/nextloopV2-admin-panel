import { NextRequest } from "next/server";
import { EnquiryService } from "../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row'))    
    const { status, ...data }  = await EnquiryService.list(pageNo, pageSize);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("ENQUIRY_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await EnquiryService.remove(deleteIds)
    return apiResponse(data, { status });
  } catch (error) {
    console.error("ENQUIRY_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}