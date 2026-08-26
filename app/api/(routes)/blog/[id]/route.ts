import { BlogService } from "@/app/api";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/blog/')[1]);
    const { status, ...data }  = await BlogService.read(id);
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("BLOG_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}