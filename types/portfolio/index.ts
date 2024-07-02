import { Json } from "../supabase/supabase";

export interface IFileUpload {
  fileId: string;
  url: string;
  status?: string;
}

export interface IPortfolio {
 id?: number;
 title: string|null;
 descp: string|null;
//  image?: (IFileUpload|Json)[]|null;
 image?: IFileUpload[];
 active?: boolean;
}