import { IAuthor } from "@/types/supabase";
import { AuthorService } from "../..";
import { NextRequest } from "next/server";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageParam = req.nextUrl.searchParams.get('page');
    const rowParam = req.nextUrl.searchParams.get('row');
    const pageNo = pageParam === null ? 1 : Number(pageParam);
    const pageSize = rowParam === null ? 10 : Number(rowParam);
    const { status, ...data } = await AuthorService.list(pageNo, pageSize);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("AUTHOR_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IAuthor = {
      name: formData.get('name') as string,
      designation: formData.get('designation') as string,
      profile: (formData.get('profile') as string) || "",
      description: (formData.get('description') as string) || "",
    }

    const { status, ...data } = await AuthorService.create(payload);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("AUTHOR_CREATE_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const payload: IAuthor = {
      name: formData.get('name') as string,
      designation: formData.get('designation') as string,
      profile: (formData.get('profile') as string) || "",
      description: (formData.get('description') as string) || "",
    }

    const { status, ...data } = await AuthorService.update(payload, id);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("AUTHOR_UPDATE_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteIds = await req.json()
    const { status, ...data } = await AuthorService.remove(deleteIds)
    return apiResponse(data, { status });
  } catch (error) {
    console.error("AUTHOR_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}

