import { IBlogMutate } from "@/types/supabase";
import { BlogService, UploadFileService } from "../..";

export async function GET() {
  try {
    const { status, ...data }  = await BlogService.list();
    if(status!==200) return Response.json({ data }, { status })
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

    const imageInfo: File | null = formData.get('imageInfo') as unknown as File; 
    if(imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);
      payload.image = [{ fileId, url }]
    } 

    const { status, ...data} = await BlogService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
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
      descp: formData.get('descp') as string,
    }

    const imageInfo: File | null = formData.get('imageInfo') as unknown as File; 
    if(imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);
      payload.image = [{ fileId, url }]
    } 
    if(deletedImage) {
      await UploadFileService.deleteFiles([deletedImage])
      if(!imageInfo) payload.image = []
    };
    const { status, ...data} = await BlogService.update(payload, id);
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("BLOG_UPDATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await BlogService.remove(deleteIds)
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("BLOG_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

