import { supabase } from "@/lib/supabase/query";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page: number = 1, limit: number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page - 1) * limit;

    const { data, count, error } = await (supabase as any)
      .from("popup_form")
      .select('id, name, email, phone, service, country, created_at', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load popup forms.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Popup forms loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load popup forms.");
  }
}

export const read = async(id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid popup form id is required.");
    const { data, error } = await (supabase as any)
      .from('popup_form')
      .select()
      .filter('id', 'eq', id)
      .single();

    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load popup form.");
    if(!data) return serviceFailure("Popup form not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Popup form loaded successfully.", undefined, { popupForm: data });
  } catch(error) {
    return serviceError(error, "Unable to load popup form.");
  }
}

export const remove = async(ids: string[]) => { 
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !id || typeof id !== "string")) return invalidInput("At least one valid popup form id is required.");
    const { data, error } = await (supabase as any)
      .from("popup_form")
      .delete()
      .in('id', ids)
      .select('id')

    if (error) return serviceError(error, "Unable to delete popup forms.");
    if (!data?.length) return serviceFailure("Popup form not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Popup form(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete popup forms.");
  }
}