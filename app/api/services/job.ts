import { supabase } from "@/lib/supabase/query";
import { IJob } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
    .from("jobs")
    .select('id, title, descp, location, job_mode, job_type, package, responsibilities, qualifications, skills, created_at, updated_at', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)
    
    if (error) return serviceError(error, "Unable to load jobs.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Jobs loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load jobs.");
  }
}

export const create = async (values: IJob) => {
  try {
    if (!values || !values.title?.trim() || !values.descp?.trim()) return invalidInput("Job title and description are required.");
    const { error } = await supabase
    .from('jobs')
    .insert(values)

    if (error) return serviceError(error, "Unable to create job.");
    return serviceSuccess(201, "Job created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create job.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid job id is required.");
    const { data, error } = await supabase
    .from('jobs')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load job.");
    if(!data) return serviceFailure("Job not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Job loaded successfully.", undefined, { job: data });
  } catch (error) {
    return serviceError(error, "Unable to load job.");
  }
} 

export const update = async (values: IJob, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || !values.title?.trim() || !values.descp?.trim()) return invalidInput("A valid job id, title, and description are required.");
    const { data, error } = await supabase
    .from('jobs')
    .update(values)
    .eq('id', id)
    .select('id')
    
    if (error) return serviceError(error, "Unable to update job.");
    if (!data?.length) return serviceFailure("Job not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Job updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update job.");
  }
}

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid job id is required.");
    const { data, error } = await supabase
    .from("jobs")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete jobs.");
    if (!data?.length) return serviceFailure("Job not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Job(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete jobs.");
  }
}