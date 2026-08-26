import { TestimonialService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/testimonial/')[1]);
    const { status, ...data }  = await TestimonialService.read(id);
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("TESTIMONIAL_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}