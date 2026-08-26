import { IdeaService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/idea/')[1]);
    const { status, ...data }  = await IdeaService.read(id);
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("IDEA_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}