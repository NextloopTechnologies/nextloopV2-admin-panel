import { ICategory } from "@/types/blog";
import { CategoryService } from "../..";
import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = req.nextUrl.searchParams.get('page') ? Number(req.nextUrl.searchParams.get('page')) : undefined;
    const pageSize = req.nextUrl.searchParams.get('row') ? Number(req.nextUrl.searchParams.get('row')) : undefined;
    const searchName = req.nextUrl.searchParams.get('q') || undefined;

    const { status, ...data } = await CategoryService.list(pageNo, pageSize, searchName);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("CATEGORY_LIST_CONTROLLER", error);
    return errorResponse(error);
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
    return apiResponse(data, { status });
  } catch (error) {
    console.error("CATEGORY_CREATE_CONTROLLER", error);
    return errorResponse(error);
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
    return apiResponse(data, { status });
  } catch (error) {
    console.error("CATEGORY_UPDATE_CONTROLLER", error);
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await req.json();
    if (payload && typeof payload === 'object' && 'reassignId' in payload) {
      const { id, reassignId } = payload;
      const { status, ...data } = await CategoryService.reassignAndRemove(Number(id), Number(reassignId));
      return apiResponse(data, { status });
    } else {
      const deleteIds = payload as number[];
      const { status, ...data } = await CategoryService.remove(deleteIds);
      return apiResponse(data, { status });
    }
  } catch (error) {
    console.error("CATEGORY_DELETE_CONTROLLER", error);
    return errorResponse(error);
  }
}
