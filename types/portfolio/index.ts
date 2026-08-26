import { IFileUpload } from "../file";

export interface IPortfolio {
 id?: number;
 title: string|null;
 descp: string|null;
 image?: IFileUpload[];
 active?: boolean;
}