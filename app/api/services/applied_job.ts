import { supabase } from "@/lib/supabase/query";
import { IAppliedJobFilters } from "@/types/applied_job";
import { deleteFiles } from "./uploadFile";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10, filters: IAppliedJobFilters) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
   
    const offset = (page-1) * limit;

    let query = (supabase as any)
    .from("applied_jobs")
    .select('id, resume, fullname, email, phone, linkedin_url, github_url, cover_letter, created_at, job_id, jobs(title)', { count: "exact" })
    .order('id', { ascending: false })

    if(Array.isArray(filters?.title)) {
      query = query.in('job_title', filters.title)
    }    
    query = query.range(offset, offset + limit - 1)
    const { data: rows, count, error } = await query

    const data = (rows || []).map((row: any) => ({
      ...row,
      title: Array.isArray(row.jobs) ? row.jobs[0]?.title : row.jobs?.title,
      job_title: Array.isArray(row.jobs) ? row.jobs[0]?.title : row.jobs?.title,
      experience: null,
      resume_id: null,
      resume_url: row.resume,
    }))
    
    if (error) return serviceError(error, "Unable to load applications.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Applications loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load applications.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid application id is required.");
    const { data, error } = await (supabase as any)
    .from('applied_jobs')
    .select('id, fullname, email, phone, linkedin_url, github_url, cover_letter, job_id, resume, jobs(title) ')
    .filter('id', 'eq', id)
    .single();

    const modifiedData = { title: data?.jobs?.title, resume_url: data?.resume, ...data }
    
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load application.");
    if(!data) return serviceFailure("Application not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Application loaded successfully.", undefined, { applied_job: modifiedData });
  } catch (error) {
    return serviceError(error, "Unable to load application.");
  }
} 

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid application id is required.");
    const { data, error } = await (supabase as any)
    .from("applied_jobs")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete applications.");
    if (!data?.length) return serviceFailure("Application not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Application(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete applications.");
  }
}

export const removeBacklogCandidates = async() => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 60) 

    const { data, error } = await (supabase as any)
    .from("applied_jobs")
    .delete()
    .lt('created_at', date.toISOString()) 
    .select('fullname, resume')
  
    if (error) return serviceError(error, "Unable to delete backlog applications.");
   
    // get resume ids to delete from imagekit
    const deleteIds = (data || [])
      .map((item: { resume?: unknown }) => item.resume)
      .filter((id: unknown): id is string => typeof id === 'string' && id !== '');

    //process 99 request for imagekit
    if(deleteIds.length>0){
      const BATCH_SIZE = 98; 
      for(let i=0; i<deleteIds.length; i+= BATCH_SIZE){
        const batch = deleteIds.slice(i, i + BATCH_SIZE);
        await deleteFiles(batch);
      }
    }
   
    return serviceSuccess(200, `${deleteIds.length} application(s) deleted successfully.`, undefined, { deletedCount: deleteIds.length });
  } catch(error) {
    return serviceError(error, "Unable to delete backlog applications.");
  }
} 
