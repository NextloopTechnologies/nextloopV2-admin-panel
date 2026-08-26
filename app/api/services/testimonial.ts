import { supabase } from "@/lib/supabase/query";
import { ITestimonial } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
    .from("testimonials")
    .select('id, feedback_by, feedback_descp, comp_and_desig ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load testimonials.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Testimonials loaded successfully.", data, { count: count ?? 0 });
  } catch(error) {
    return serviceError(error, "Unable to load testimonials.");
  }
}

export const create = async (values: ITestimonial) => {
  try {
    if (!values || !values.feedback_by?.trim() || !values.feedback_descp?.trim()) return invalidInput("Testimonial author and description are required.");
    const { error } = await supabase
    .from('testimonials')
    .insert(values)

    if (error) return serviceError(error, "Unable to create testimonial.");
    return serviceSuccess(201, "Testimonial created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create testimonial.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid testimonial id is required.");
    const { data, error } = await supabase
    .from('testimonials')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load testimonial.");
    if(!data) return serviceFailure("Testimonial not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Testimonial loaded successfully.", undefined, { testimonial: data });
  } catch (error) {
    return serviceError(error, "Unable to load testimonial.");
  }
} 

export const update = async (values: ITestimonial, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || !values.feedback_by?.trim() || !values.feedback_descp?.trim()) return invalidInput("A valid testimonial id, author, and description are required.");
    const { data, error } = await supabase
    .from('testimonials')
    .update(values)
    .eq('id', id)
    .select('id')

    if (error) return serviceError(error, "Unable to update testimonial.");
    if (!data?.length) return serviceFailure("Testimonial not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Testimonial updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update testimonial.");
  }
}

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid testimonial id is required.");
    const { data, error } = await supabase
    .from("testimonials")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete testimonials.");
    if (!data?.length) return serviceFailure("Testimonial not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Testimonial(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete testimonials.");
  }
}