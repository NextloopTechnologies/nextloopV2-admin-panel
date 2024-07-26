import { IFileUpload } from "../file";

export interface IBlog {
    id?: number;
    title: string|null;
    descp: string|null;
    image?: IFileUpload[];
    active?: boolean;
}