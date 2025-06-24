import { supabase } from "@/lib/supabase/query";
import { IAppliedJobFilters } from "@/types/applied_job";
import { deleteFiles } from "./uploadFile";

export const list = async(page:number = 1, limit:number = 10, filters: IAppliedJobFilters) => {
  try {
   
    const offset = (page-1) * limit;

    let query = supabase
    .from("applied_jobs_with_title")
    .select('*', { count: "exact" })
    .order('id', { ascending: false })

    if(Array.isArray(filters?.title)) {
      query = query.in('job_title', filters.title)
    }    
    if(Array.isArray(filters?.experience)) {
      query = query.in('experience', filters.experience)
    }

    query = query.range(offset, offset + limit - 1)
    const { data, count, error } = await query
    
    if(data) return { success: true , data , count, status: 200 }
    return { success: false, msgText: "No records found!",  status: 404 }
  } catch(error) {
    throw error
  }
}

export const read = async (id: number) => {
  try {
    const { data } = await supabase
    .from('applied_jobs')
    .select('id, fullname, email, phone, linkedin_url, github_url, cover_letter, job_id, resume_url, experience, resume_id, jobs(title) ')
    .filter('id', 'eq', id)
    .single();

    const modifiedData = { title: data?.jobs?.title, ...data }
    
    if(!data) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true , applied_job: modifiedData, status: 200 }
  } catch (error) {
    throw error
  }
} 

export const remove = async(ids: number[]) => {
  try {
    const { error } = await supabase
    .from("applied_jobs")
    .delete()
    .in('id', ids)

    if(error) return { success: false , msgText: "No record found!", status: 404 }
    return { success: true , msgText: "Deleted!", status: 200 }
  } catch(error) {
    throw error
  }
}

export const removeBacklogCandidates = async() => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 60) 

    const { data, error } = await supabase
    .from("applied_jobs")
    .delete()
    .lt('created_at', date.toISOString()) 
    .select('fullname, resume_id')
  
    if(error) return { success: false , msgText: "No record found!", status: 404 }
   
    // get resume ids to delete from imagekit
    const deleteIds = data
      .map(item => item.resume_id)
      .filter((id): id is string => typeof id === 'string' && id !== '');

    //process 99 request for imagekit
    if(deleteIds.length>0){
      const BATCH_SIZE = 98; 
      for(let i=0; i<deleteIds.length; i+= BATCH_SIZE){
        const batch = deleteIds.slice(i, i + BATCH_SIZE);
        await deleteFiles(batch);
      }
    }
   
    return { success: true , msgText: `${deleteIds.length} Deleted!`, status: 200 }
  } catch(error) {
    throw error
  }
} 
