import { NextRequest } from "next/server";
import { PortfolioService, UploadFileService } from "../..";
import { IPortfolioMutate } from "@/types/supabase";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row')) 
    const { status, ...data }  = await PortfolioService.list(pageNo, pageSize);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("PORTFOLIO_LIST_CONTROLLER", error)
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IPortfolioMutate = {
      title: formData.get('title') as string, 
      descp: formData.get('descp') as string
    }

    const imageInfo: File | null = formData.get('imageInfo') as unknown as File; 
    if(imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);
      payload.image = [{ fileId, url }]
    } 

    const { status, ...data} = await PortfolioService.create(payload);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("PORTFOLIO_CREATE_CONTROLLER", error)
    return errorResponse(error);
  }  
}

export async function PUT(req: Request) {
  try {    
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const deletedImage = formData.get("deletedImage")?.toString() || "";
    const payload: IPortfolioMutate = {
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
    const { status, ...data} = await PortfolioService.update(payload, id);
    return apiResponse(data, { status });
  } catch (error) {
    console.error("PORTFOLIO_UPDATE_CONTROLLER", error)
    return errorResponse(error);
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await PortfolioService.remove(deleteIds)
    return apiResponse(data, { status });
  } catch (error) {
    console.error("PORTFOLIO_DELETE_CONTROLLER", error)
    return errorResponse(error);
  }
}

