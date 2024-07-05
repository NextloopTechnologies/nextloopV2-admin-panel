import { PortfolioService } from "@/app/api";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/portfolio/')[1]);
    const { status, ...data }  = await PortfolioService.read(id);
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("PORTFOLIO_READ_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}