import { PortfolioService, UploadFileService } from "../..";
import { IPortfolio } from "@/types/portfolio";

export async function GET() {
  try {
    const { status, ...data }  = await PortfolioService.list();
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("PORTFOLIO_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IPortfolio = {
      title: formData.get('title') as string, 
      descp: formData.get('descp') as string
    }

    const imageInfo: File | null = formData.get('imageInfo') as unknown as File; 
    if(imageInfo) {
      const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);
      payload.image = [{ fileId, url }]
    } 

    const { status, ...data} = await PortfolioService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("PORTFOLIO_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

