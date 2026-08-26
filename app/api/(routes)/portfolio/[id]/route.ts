import { PortfolioService } from "@/app/api";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

export async function GET(req: Request) {
  try {
    const id = Number(req.url.split('/portfolio/')[1]);
    const result = await PortfolioService.read(id);
    return apiResponse(result);
  } catch (error) {
    console.error("PORTFOLIO_READ_CONTROLLER", error)
    return errorResponse(error);
  }
}