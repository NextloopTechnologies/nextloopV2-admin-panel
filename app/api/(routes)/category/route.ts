import { ICategory } from "@/types/blog";
import { CategoryService } from "../..";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const pageNo = req.nextUrl.searchParams.get('page') ? Number(req.nextUrl.searchParams.get('page')) : undefined;
    const pageSize = req.nextUrl.searchParams.get('row') ? Number(req.nextUrl.searchParams.get('row')) : undefined;
    const searchName = req.nextUrl.searchParams.get('q') || undefined;

    const { status, ...data } = await CategoryService.list(pageNo, pageSize, searchName);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("CATEGORY_LIST_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: Omit<ICategory, 'id' | 'created_at'> = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || "",
    };

    const { status, ...data } = await CategoryService.create(payload);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("CATEGORY_CREATE_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const payload: Partial<ICategory> = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string || "",
    };

    const { status, ...data } = await CategoryService.update(payload, id);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("CATEGORY_UPDATE_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await req.json();
    if (payload && typeof payload === 'object' && 'reassignId' in payload) {
      const { id, reassignId } = payload;
      const { status, ...data } = await CategoryService.reassignAndRemove(Number(id), Number(reassignId));
      return Response.json({ data }, { status });
    } else {
      const deleteIds = payload as number[];
      const { status, ...data } = await CategoryService.remove(deleteIds);
      return Response.json({ data }, { status });
    }
  } catch (error) {
    console.error("CATEGORY_DELETE_CONTROLLER", error);
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 });
  }
}
