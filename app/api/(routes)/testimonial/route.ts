import { ITestimonial } from "@/types/supabase";
import { TestimonialService } from "../..";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row')) 
    const { status, ...data }  = await TestimonialService.list(pageNo, pageSize);
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("TESTIMONIAL_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: ITestimonial = {
      feedback_by: formData.get('feedback_by') as string, 
      feedback_descp: formData.get('feedback_descp') as string,
      comp_and_desig: formData.get('comp_and_desig') as string
    }

    const { status, ...data} = await TestimonialService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("TESTIMONIAL_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function PUT(req: Request) {
  try {    
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const payload: ITestimonial = {
      feedback_by: formData.get('feedback_by') as string, 
      feedback_descp: formData.get('feedback_descp') as string,
      comp_and_desig: formData.get('comp_and_desig') as string
    }
    
    const { status, ...data} = await TestimonialService.update(payload, id);
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("TESTIMONIAL_UPDATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await TestimonialService.remove(deleteIds)
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("TESTIMONIAL_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

