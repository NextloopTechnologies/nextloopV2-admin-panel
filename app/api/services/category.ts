import { supabase } from "@/lib/supabase/query";
import { ICategory } from "@/types/blog";

export const list = async (page?: number, limit?: number, searchName?: string) => {
  try {
    let query = supabase
      .from("categories")
      .select('id, name, slug, description, created_at, updated_at, blogs(id)', { count: "exact" });

    if (searchName) {
      query = query.ilike('name', `%${searchName}%`);
    }

    // Default order
    query = query.order('id', { ascending: false });

    if (page && limit) {
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("SUPABASE_CATEGORY_LIST_ERROR:", error);
      return { success: false, msgText: error.message, status: 500 };
    }

    const mappedData = data?.map((cat: any) => {
      const blogsCount = Array.isArray(cat.blogs) ? cat.blogs.length : 0;
      const { blogs, ...rest } = cat;
      return {
        ...rest,
        blogs_count: blogsCount
      };
    }) || [];
    if (mappedData.length === 0) {
      return { success: true, data: [], count: 0, msgText: "No records found!", status: 200 };
    }
    return { success: true, data: mappedData, count: count || 0, status: 200 };
  } catch (error) {
    throw error;
  }
};

export const create = async (values: Omit<ICategory, 'id' | 'created_at'>) => {
  try {
    const { error } = await supabase
      .from('categories')
      .insert({
        name: values.name,
        slug: values.slug,
        description: values.description
      });

    if (!error) return { success: true, msgText: "Created!", status: 201 };
    console.error("SUPABASE_CATEGORY_CREATE_ERROR:", error);
    return { success: false, msgText: error.message || "Failed to create!", status: 500 };
  } catch (error) {
    throw error;
  }
};

export const read = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("SUPABASE_CATEGORY_READ_ERROR:", error);
      return { success: false, msgText: "No record found!", status: 404 };
    }
    return { success: true, category: data, status: 200 };
  } catch (error) {
    throw error;
  }
};

export const update = async (values: Partial<ICategory>, id: number) => {
  try {
    const updateData: any = {};
    if (values.name !== undefined) updateData.name = values.name;
    if (values.slug !== undefined) updateData.slug = values.slug;
    if (values.description !== undefined) updateData.description = values.description;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (!error) return { success: true, msgText: "Updated!", status: 200 };
    console.error("SUPABASE_CATEGORY_UPDATE_ERROR:", error);
    return { success: false, msgText: error.message || "Failed to update!", status: 500 };
  } catch (error) {
    throw error;
  }
};

export const remove = async (ids: number[]) => {
  try {
    // Check if any of these categories are assigned to blogs
    const { data: activeBlogs, error: blogCheckError } = await supabase
      .from("blogs")
      .select("id, category_id")
      .in("category_id", ids);

    if (blogCheckError) {
      return { success: false, msgText: "Failed to perform validation check.", status: 500 };
    }

    if (activeBlogs && activeBlogs.length > 0) {
      return {
        success: false,
        msgText: "One or more categories cannot be deleted because they are assigned to blogs.",
        status: 400
      };
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .in('id', ids);

    if (error) {
      console.error("SUPABASE_CATEGORY_DELETE_ERROR:", error);
      return { success: false, msgText: "Failed to delete!", status: 500 };
    }
    return { success: true, msgText: "Deleted!", status: 200 };
  } catch (error) {
    throw error;
  }
};

export const reassignAndRemove = async (id: number, reassignId: number) => {
  try {
    // 1. Move all blogs from category id to reassignId
    const { error: moveError } = await supabase
      .from("blogs")
      .update({ category_id: reassignId })
      .eq("category_id", id);

    if (moveError) {
      console.error("SUPABASE_REASSIGN_ERROR:", moveError);
      return { success: false, msgText: "Failed to reassign blogs.", status: 500 };
    }

    // 2. Delete category id
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("SUPABASE_CATEGORY_DELETE_AFTER_REASSIGN_ERROR:", deleteError);
      return { success: false, msgText: "Blogs reassigned but failed to delete category.", status: 500 };
    }

    return { success: true, msgText: "Blogs reassigned and category deleted successfully!", status: 200 };
  } catch (error) {
    throw error;
  }
};
