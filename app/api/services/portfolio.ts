import { supabase } from "@/lib/supabase/query";
import { IPortfolioMutate } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
    .from("portfolio")
    .select('id, title, descp, image ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load portfolio items.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Portfolio items loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load portfolio items.");
  }
}

export const create = async (values: IPortfolioMutate) => {
  try {
    if (!values || !values.title?.trim()) return invalidInput("Portfolio title is required.");
    const { error } = await supabase
    .from('portfolio')
    .insert(values)

    if (error) return serviceError(error, "Unable to create portfolio item.");
    return serviceSuccess(201, "Portfolio item created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create portfolio item.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid portfolio id is required.");
    const { data, error } = await supabase
    .from('portfolio')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load portfolio item.");
    if(!data) return serviceFailure("Portfolio item not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Portfolio item loaded successfully.", undefined, { portfolio: data });
  } catch (error) {
    return serviceError(error, "Unable to load portfolio item.");
  }
} 

export const update = async (values: IPortfolioMutate, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || !values.title?.trim()) return invalidInput("A valid portfolio id and title are required.");
    const { data, error } = await supabase
    .from('portfolio')
    .update(values)
    .eq('id', id)
    .select('id')

    if (error) return serviceError(error, "Unable to update portfolio item.");
    if (!data?.length) return serviceFailure("Portfolio item not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Portfolio item updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update portfolio item.");
  }
}

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid portfolio id is required.");
    const { data, error } = await supabase
    .from("portfolio")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete portfolio items.");
    if (!data?.length) return serviceFailure("Portfolio item not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Portfolio item(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete portfolio items.");
  }
}