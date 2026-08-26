import { supabase } from "@/lib/supabase/query";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
    .from("ideas")
    .select('id, mail, idea_descp ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load ideas.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Ideas loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load ideas.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid idea id is required.");
    const { data, error } = await supabase
    .from('ideas')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load idea.");
    if(!data) return serviceFailure("Idea not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Idea loaded successfully.", undefined, { idea: data });
  } catch (error) {
    return serviceError(error, "Unable to load idea.");
  }
} 

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid idea id is required.");
    const { data, error } = await supabase
    .from("ideas")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete ideas.");
    if (!data?.length) return serviceFailure("Idea not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Idea(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete ideas.");
  }
}