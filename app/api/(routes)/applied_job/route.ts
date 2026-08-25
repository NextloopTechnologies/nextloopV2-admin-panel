import { NextRequest } from "next/server";
import { AppliedJobService } from "../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageParam = req.nextUrl.searchParams.get('page');
    const rowParam = req.nextUrl.searchParams.get('row');
    const pageNo = pageParam === null ? 1 : Number(pageParam);
    const pageSize = rowParam === null ? 10 : Number(rowParam);
    const filters = JSON.parse(req.nextUrl.searchParams.get('filters') ?? "{}");
    const { status, ...data }  = await AppliedJobService.list(pageNo, pageSize, filters);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("JOB_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    let response
    const deleteIds =  await req.json()
    if(Array.isArray(deleteIds) && deleteIds.length>0) {
      response = await AppliedJobService.remove(deleteIds)
    } else {
      response = await AppliedJobService.removeBacklogCandidates()
    }
    if (!response) {
      return errorResponse(new Error("No response from service."));
    }
    const { status, ...data } = response;
    return apiResponse(data, { status });
  } catch (error) {
    console.error("JOB_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}

