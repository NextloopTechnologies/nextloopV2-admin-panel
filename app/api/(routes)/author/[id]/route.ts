import { AuthorService } from "../../..";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/author/')[1]);
    const { status, ...data }  = await AuthorService.read(id);
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("AUTHOR_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}