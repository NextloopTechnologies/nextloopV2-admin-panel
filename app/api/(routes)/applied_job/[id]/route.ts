import { AppliedJobService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/applied_job/')[1]);
    const { status, ...data }  = await AppliedJobService.read(id);
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("APPLIEDJOB_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}