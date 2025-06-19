import { NextRequest } from "next/server";
import { AppliedJobService } from "../..";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) || 1
    const pageSize = Number(req.nextUrl.searchParams.get('row')) || 10  
    const filters = JSON.parse(req.nextUrl.searchParams.get('filters') ?? "{}");
    const { status, ...data }  = await AppliedJobService.list(pageNo, pageSize, filters);
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("JOB_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
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
      return Response.json({ msgText: "No response from service." }, { status: 500 });
    }
    const { status, ...data } = response;
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("JOB_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

