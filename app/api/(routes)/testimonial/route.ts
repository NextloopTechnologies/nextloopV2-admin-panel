import { ITestimonial } from "@/types/supabase";
import { TestimonialService } from "../..";
import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row')) 
    const { status, ...data }  = await TestimonialService.list(pageNo, pageSize);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("TESTIMONIAL_LIST_CONTROLLER", error)
    return errorResponse(error);
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
    return apiResponse(data, { status });
  } catch (error) {
    console.error("TESTIMONIAL_CREATE_CONTROLLER", error)
    return errorResponse(error);
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
    return apiResponse(data, { status });
  } catch (error) {
    console.error("TESTIMONIAL_UPDATE_CONTROLLER", error)
    return errorResponse(error);
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await TestimonialService.remove(deleteIds)
    return apiResponse(data, { status });
  } catch (error) {
    console.error("TESTIMONIAL_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}

