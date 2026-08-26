import { EnquiryService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/enquiry/')[1]);
    const { status, ...data }  = await EnquiryService.read(id);
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("ENQUIRY_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}