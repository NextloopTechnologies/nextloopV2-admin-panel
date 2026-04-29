import { PopupFormService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/popup-form/')[1]); 
    const { status, ...data } = await PopupFormService.read(id);
    return Response.json({ data }, { status })
  } catch (error) {
    console.error("POPUP_FORM_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}