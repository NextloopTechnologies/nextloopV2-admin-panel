import { supabase } from "@/lib/supabase/query";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    const offset = (page-1) * limit;

    const { data, count } = await supabase
    .from("applied_jobs")
    .select('id, fullname, email, phone, linkedin_url, github_url, cover_letter, job_id, resume_url, resume_id, jobs(title) ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    const modifiedData = data?.map((value) => ({ title: value.jobs?.title, ...value }))
    
    if(data) return { success: true , data: modifiedData, count, status: 200 }
    return { success: false, msgText: "No records found!",  status: 404 }
  } catch(error) {
    throw error
  }
}

export const read = async (id: number) => {
  try {
    const { data } = await supabase
    .from('applied_jobs')
    .select('id, fullname, email, phone, linkedin_url, github_url, cover_letter, job_id, resume_url, resume_id, jobs(title) ')
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