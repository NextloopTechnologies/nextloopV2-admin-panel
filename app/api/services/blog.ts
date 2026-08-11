import { supabase } from "@/lib/supabase/query";
import { IBlogMutate } from "@/types/supabase";

export const list = async (page: number = 1, limit: number = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("blogs")
      .select('id, title, descp, image, created_at, status, category_id, categories(id, name), author(id, name, designation, description, profile), tags, canonical_url, read_time', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("SUPABASE_LIST_ERROR:", error);
    }

    if (data) return { success: true, data, count, status: 200 }
    return { success: false, msgText: "No records found!", status: 404 }
  } catch (error) {
    throw error
  }
}

export const create = async (values: IBlogMutate) => {
  try {
    const { error } = await supabase
      .from('blogs')
      .insert(values)

    if (!error) return { success: true, msgText: "Created!", status: 201 }
    console.error("SUPABASE_CREATE_ERROR:", error);
    return { success: false, msgText: "Failed to create!", status: 500 }
  } catch (error) {
    throw error
  }
}

export const read = async (id: number) => {
  try {
    const { data } = await supabase
      .from('blogs')
      .select()
      .filter('id', 'eq', id)
      .single();

    if (!data) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true, blog: data, status: 200 }
  } catch (error) {
    throw error
  }
}

export const update = async (values: IBlogMutate, id: number) => {
  try {
    const { error } = await supabase
      .from('blogs')
      .update(values)
      .eq('id', id)

    if (!error) return { success: true, msgText: "Updated!", status: 200 }
    console.error("SUPABASE_UPDATE_ERROR:", error);
    return { success: false, msgText: "Failed to update!", status: 500 }
  } catch (error) {
    throw error
  }
}

export const remove = async (ids: number[]) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .delete()
      .in('id', ids)
      .select();

    if (error) return { success: false, msgText: "Failed to delete!", status: 404 }
    return { success: true, deletedData: data, msgText: "Deleted!", status: 200 }
  } catch (error) {
    throw error
  }
}

export const search = async (query: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select('id, title')
      .ilike('title', `%${query}%`)
      .order('title', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [], status: 200 };
  } catch (error) {
    throw error;
  }
}