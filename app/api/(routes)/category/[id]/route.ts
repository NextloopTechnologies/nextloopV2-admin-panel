import { CategoryService } from "@/app/api";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/category/')[1]);
    const { status, ...data } = await CategoryService.read(id);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("CATEGORY_READ_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}
