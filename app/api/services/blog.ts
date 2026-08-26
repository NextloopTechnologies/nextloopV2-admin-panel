import { supabase } from "@/lib/supabase/query";
import { IBlogMutate } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async (page: number = 1, limit: number = 10) => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("blogs")
      .select('id, title, descp, image, created_at, status, category_id, categories(id, name), author(id, name, designation, description, profile), tags, canonical_url, read_time, featured_blogs, meta_keywords', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return serviceError(error, "Unable to load blogs.");
    if (!data?.length) return serviceSuccess(200, "No records found.", [], { count: 0 });
    return serviceSuccess(200, "Blogs loaded successfully.", data, { count: count ?? 0 });
  } catch (error) {
    return serviceError(error, "Unable to load blogs.");
  }
}

export const create = async (values: IBlogMutate) => {
  try {
    if (!values || !values.title?.trim() || !values.descp?.trim()) return invalidInput("Blog title and description are required.");
    const { error } = await supabase
      .from('blogs')
      .insert(values)

    if (error) return serviceError(error, "Unable to create blog.");
    return serviceSuccess(201, "Blog created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create blog.");
  }
}

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid blog id is required.");
    const { data, error } = await supabase
      .from('blogs')
      .select()
      .filter('id', 'eq', id)
      .single();

    if (error && error.code !== "PGRST116") return serviceError(error, "Unable to load blog.");
    if (!data) return serviceFailure("Blog not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Blog loaded successfully.", undefined, { blog: data });
  } catch (error) {
    return serviceError(error, "Unable to load blog.");
  }
}

export const update = async (values: IBlogMutate, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || !values.title?.trim() || !values.descp?.trim()) return invalidInput("A valid blog id, title, and description are required.");
    const { data, error } = await supabase
      .from('blogs')
      .update(values)
      .eq('id', id)
      .select('id')

    if (error) return serviceError(error, "Unable to update blog.");
    if (!data?.length) return serviceFailure("Blog not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Blog updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update blog.");
  }
}

export const remove = async (ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid blog id is required.");
    const { data, error } = await supabase
      .from("blogs")
      .delete()
      .in('id', ids)
      .select();

    if (error) return serviceError(error, "Unable to delete blogs.");
    if (!data?.length) return serviceFailure("Blog not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Blog(s) deleted successfully.", undefined, { deletedData: data });
  } catch (error) {
    return serviceError(error, "Unable to delete blogs.");
  }
}

export const search = async (query: string, limit: number = 10) => {
  try {
    if (!query?.trim() || !Number.isInteger(limit) || limit < 1 || limit > 1000) return invalidInput("Search query is required and limit must be between 1 and 1000.");
    const { data, error } = await supabase
      .from("blogs")
      .select('id, title')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true })
      .limit(limit);

    if (error) return serviceError(error, "Unable to search blogs.");
    return serviceSuccess(200, data?.length ? "Blogs found." : "No blogs found.", data || []);
  } catch (error) {
    return serviceError(error, "Unable to search blogs.");
  }
}