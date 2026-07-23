import { IBlogMutate } from "@/types/supabase";
import { BlogService, UploadFileService } from "../..";
import { NextRequest } from "next/server";
import { IBlog } from "@/types/blog";
import { deleteFiles } from "../../services/uploadFile";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) || 1;
    const pageSize = Number(req.nextUrl.searchParams.get('row')) || 10;
    const { status, ...data } = await BlogService.list(pageNo, pageSize);
    return Response.json({ data }, { status })
  } catch (error) {
    console.error("BLOG_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IBlogMutate = {
      title: formData.get('title') as string,
      descp: formData.get('descp') as string
    }

    const folder = formData.get('folder')?.toString() || "AdminNextloop/Blogs";
    const imageInfo: File | null = formData.get('imageInfo') as unknown as File;
    if (imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name, folder);
      payload.image = [{ fileId, url }]
    }

    if (formData.has('descp_image_ids')) {
      const entries = formData.getAll('descp_image_ids');
      const descpImagesIds: { fileId: string, url: string }[] = entries.map(item => JSON.parse(item.toString()));
      if (!Array.isArray(payload.image)) payload.image = [];
      payload.image = [...payload.image, ...descpImagesIds];
    }

    const { status, ...data } = await BlogService.create(payload);
    return Response.json({ data }, { status });

  } catch (error) {
    console.error("BLOG_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const deletedImage = formData.get("deletedImage")?.toString() || "";
    const payload: IBlogMutate = {
      title: formData.get('title') as string,
      descp: formData.get('descp') as string
    }

    const folder = formData.get('folder')?.toString() || "AdminNextloop/Blogs";
    const imageInfo: File | null = formData.get('imageInfo') as unknown as File;
    if (imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name, folder);
      payload.image = [{ fileId, url }]
    }
    if (deletedImage) {
      await UploadFileService.deleteFiles([deletedImage])
      if (!imageInfo) payload.image = []
    };
    const { status, ...data } = await BlogService.update(payload, id);
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("BLOG_UPDATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const deleteIds = await req.json()
    const result = await BlogService.remove(deleteIds);
    const { status, success, msgText } = result;
    let deletedData: IBlog[] | null | undefined = undefined;
    if (Array.isArray(result.deletedData)) {
      deletedData = result.deletedData.map(item => ({
        ...item,
        image: Array.isArray(item.image) ? item.image : (item.image ? JSON.parse(item.image as any) : undefined)
      }));

      if (deletedData?.length) {
        const fileIds = deletedData
          .filter(item => Array.isArray(item.image) && item.image.length)
          .flatMap(item => item.image as { fileId: string; url: string }[])
          .filter((img): img is { fileId: string; url: string } => !!img && typeof img.fileId?.toString() === "string")
          .map(img => img.fileId);

        if (fileIds.length) await UploadFileService.deleteFiles(fileIds);
      }
    }

    return Response.json({ data: { success, msgText } }, { status });
  } catch (error) {
    console.error("BLOG_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

