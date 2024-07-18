import { ITestimonial } from "@/types/testimonial";
import { TestimonialService } from "../..";

export async function GET() {
  try {
    const { status, ...data }  = await TestimonialService.list();
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
    console.error("PORTFOLIO_CREATE_CONTROLLER", error)
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

