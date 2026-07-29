import { IFileUpload } from "../file";
import { IAuthor } from "../supabase";

export interface IBlog {
    id?: number;
    title: string | null;
    descp: string | null;
    image?: IFileUpload[];
    author?: IAuthor;
    author_id?: number | null;
    active?: boolean;
    created_at?: string;
    service?: string | null;
    slug?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
}