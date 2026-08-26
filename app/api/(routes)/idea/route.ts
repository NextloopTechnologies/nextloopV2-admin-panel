import { NextRequest } from "next/server";
import { IdeaService } from "../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row')) 
    const { status, ...data }  = await IdeaService.list(pageNo, pageSize);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("IDEA_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await IdeaService.remove(deleteIds)
    return apiResponse(data, { status });
  } catch (error) {
    console.error("IDEA_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}

