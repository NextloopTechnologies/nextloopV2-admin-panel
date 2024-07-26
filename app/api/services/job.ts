import { supabase } from "@/lib/supabase/query";
import { IJob } from "@/types/supabase";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    const offset = (page-1) * limit;

    const { data, count } = await supabase
    .from("jobs")
    .select('id, title, descp, location ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if(data) return { success: true , data, count, status: 200 }
    return { success: false, msgText: "No records found!",  status: 404 }
  } catch(error) {
    throw error
  }
}

export const create = async (values: IJob) => {
  try {
    const { error } = await supabase
    .from('jobs')
    .insert(values)

    if(!error) return { success: true, msgText: "Created!", status: 201 }
    return { success: false, msgText: "Failed to create!", status: 500 }
  } catch (error) {
    throw error
  }
}

export const read = async (id: number) => {
  try {
    const { data } = await supabase
    .from('jobs')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if(!data) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true , job: data, status: 200 }
  } catch (error) {
    throw error
  }
} 

export const update = async (values: IJob, id: number) => {
  try {
    const { error } = await supabase
    .from('jobs')
    .update(values)
    .eq('id', id)

    if(!error) return { success: true, msgText: "Updated!", status: 200 }
    return { success: false, msgText: "Failed to create!", status: 500 }
  } catch (error) {
    throw error
  }
}

export const remove = async(ids: number[]) => {
  try {
    const { error } = await supabase
    .from("jobs")
    .delete()
    .in('id', ids)

    if(error) return { success: false , msgText: "No record found!", status: 404 }
    return { success: true , msgText: "Deleted!", status: 200 }
  } catch(error) {
    throw error
  }
}