import { supabase } from "@/lib/supabase/query";
import { IAuthor } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
    .from("author")
    .select('id, name, designation, description, profile', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load authors.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Authors loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load authors.");
  }
}

export const create = async (values: IAuthor) => {
  try {
    if (!values || !values.name?.trim()) return invalidInput("Author name is required.");
    const { error } = await supabase
    .from('author')
    .insert(values)

    if (error) return serviceError(error, "Unable to create author.");
    return serviceSuccess(201, "Author created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create author.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid author id is required.");
    const { data, error } = await supabase
    .from('author')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load author.");
    if(!data) return serviceFailure("Author not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Author loaded successfully.", undefined, { author: data });
  } catch (error) {
    return serviceError(error, "Unable to load author.");
  }
} 

export const update = async (values: IAuthor, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || !values.name?.trim()) return invalidInput("A valid author id and name are required.");
    const { data, error } = await supabase
    .from('author')
    .update(values)
    .eq('id', id)
    .select('id')

    if (error) return serviceError(error, "Unable to update author.");
    if (!data?.length) return serviceFailure("Author not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Author updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update author.");
  }
}

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid author id is required.");
    const { data, error } = await supabase
    .from("author")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete authors.");
    if (!data?.length) return serviceFailure("Author not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Author(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete authors.");
  }
}