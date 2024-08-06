import { Enums, IJob } from "@/types/supabase";
import { JobService } from "../..";

export async function GET() {
  try {
    const { status, ...data }  = await JobService.list();
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("JOB_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IJob = {
      title: formData.get('title') as string, 
      descp: formData.get('descp') as string,
      responsibilities: formData.getAll('responsibilities[]') as string[],
      qualifications: formData.getAll('qualifications[]') as string[],
      skills: formData.getAll('skills[]') as string[],
      location: formData.get("location") as string,
      job_mode: formData.get("job_mode") as Enums<'enum_job_mode'>,
      package: formData.get("package") as string,
      job_type: formData.get("job_type") as Enums<'enum_job_type'>,
    }
    
    const { status, ...data} = await JobService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("JOB_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function PUT(req: Request) {
  try {    
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const payload: IJob = {
      title: formData.get('title') as string, 
      descp: formData.get('descp') as string,
      responsibilities: formData.getAll('responsibilities[]') as string[],
      qualifications: formData.getAll('qualifications[]') as string[],
      skills: formData.getAll('skills[]') as string[],
      location: formData.get("location") as string,
      job_mode: formData.get("job_mode") as Enums<'enum_job_mode'>,
      package: formData.get("package") as string,
      job_type: formData.get("job_type") as Enums<'enum_job_type'>,
    }
    
    const { status, ...data} = await JobService.update(payload, id);
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("JOB_UPDATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await JobService.remove(deleteIds)
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("JOB_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

