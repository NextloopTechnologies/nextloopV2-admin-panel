import { Enums, IAppliedJob } from "@/types/supabase";
import { AppliedJobService, UploadFileService } from "../..";
import { AppliedJobSchema } from "@/lib/validations";
import { formatErrorData } from "@/lib/utils";

export async function GET() {
  try {
    const { status, ...data }  = await AppliedJobService.list();
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("JOB_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const reqBody = await req.json()
    const {success, data: validatedValues, error: errorResponse } = AppliedJobSchema.safeParse(reqBody)
    if(errorResponse?.errors.length){
      const formattedErrors = formatErrorData(errorResponse.errors)
      return Response.json({ success, error: formattedErrors }, { status: 400 })
    }
    
    // const formData = await req.formData();
    const payload: IAppliedJob = { ...validatedValues }
      // job_id: formData.get('fullname') as string,
     
    

    // const imageInfo: File | null = formData.get('imageInfo') as unknown as File; 
    // if(imageInfo) {
    //   const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);
    //   payload.resumeId = fileId
    //   payload.resumeUrl = url 
    // } 
    // console.log("paylaod", payload);
    
    const { status, ...data} = await AppliedJobService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
    // return Response.json({ success, data }, { status: 200 })
  } catch (error) {
    console.error("JOB_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

// export async function PUT(req: Request) {
//   try {    
//     const formData = await req.formData();
//     const id = Number(formData.get("id"));
//     const payload: IAppliedJob = {
//       title: formData.get('title') as string, 
//       descp: formData.get('descp') as string,
//       responsibilities: formData.getAll('responsibilities[]') as string[],
//       qualifications: formData.getAll('qualifications[]') as string[],
//       skills: formData.getAll('skills[]') as string[],
//       location: formData.get("location") as string,
//       job_mode: formData.get("job_mode") as Enums<'enum_job_mode'>,
//       package: formData.get("package") as string,
//       job_type: formData.get("job_type") as Enums<'enum_job_type'>,
//     }
    
//     const { status, ...data} = await AppliedJobService.update(payload, id);
//     if(status!==200) return Response.json({ data }, { status });
//     return Response.json({ data }, { status });
//   } catch (error) {
//     console.error("JOB_UPDATE_CONTROLLER", error)
//     return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
//   }  
// }

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await AppliedJobService.remove(deleteIds)
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("JOB_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

