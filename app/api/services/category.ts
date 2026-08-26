import { supabase } from "@/lib/supabase/query";
import { ICategory } from "@/types/blog";
import { invalidInput, serviceError, serviceFailure, serviceSuccess } from "@/app/api/utils/response";

export const list = async (page?: number, limit?: number, searchName?: string) => {
  try {
    if ((page !== undefined && (!Number.isInteger(page) || page < 1)) || (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 1000))) return invalidInput("Page must be at least 1 and row must be between 1 and 1000.");
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
      return serviceError(error, "Unable to load categories.");
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
      return serviceSuccess(200, "No records found.", [], { count: 0 });
    }
    return serviceSuccess(200, "Categories loaded successfully.", mappedData, { count: count || 0 });
  } catch (error) {
    return serviceError(error, "Unable to load categories.");
  }
};

export const create = async (values: Omit<ICategory, 'id' | 'created_at'>) => {
  try {
    if (!values?.name?.trim() || !values?.slug?.trim()) return invalidInput("Category name and slug are required.");
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: values.name,
        slug: values.slug,
        description: values.description
      });

    if (error) return serviceError(error, "Unable to create category.");
    return serviceSuccess(201, "Category created successfully.");
  } catch (error) {
    return serviceError(error, "Unable to create category.");
  }
};

export const read = async (id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1) return invalidInput("A valid category id is required.");
    const { data, error } = await supabase
      .from('categories')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("SUPABASE_CATEGORY_READ_ERROR:", error);
      if (error?.code === "PGRST116" || !data) return serviceFailure("Category not found.", 404, "NOT_FOUND");
      return serviceError(error, "Unable to load category.");
    }
    return serviceSuccess(200, "Category loaded successfully.", undefined, { category: data });
  } catch (error) {
    return serviceError(error, "Unable to load category.");
  }
};

export const update = async (values: Partial<ICategory>, id: number) => {
  try {
    if (!Number.isInteger(id) || id < 1 || !values || (values.name !== undefined && !values.name.trim()) || (values.slug !== undefined && !values.slug.trim())) return invalidInput("A valid category id and values are required.");
    const updateData: any = {};
    if (values.name !== undefined) updateData.name = values.name;
    if (values.slug !== undefined) updateData.slug = values.slug;
    if (values.description !== undefined) updateData.description = values.description;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('id');

    if (error) return serviceError(error, "Unable to update category.");
    if (!data?.length) return serviceFailure("Category not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Category updated successfully.");
  } catch (error) {
    return serviceError(error, "Unable to update category.");
  }
};

export const remove = async (ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid category id is required.");
    // Check if any of these categories are assigned to blogs
    const { data: activeBlogs, error: blogCheckError } = await supabase
      .from("blogs")
      .select("id, category_id")
      .in("category_id", ids);

    if (blogCheckError) {
      return serviceError(blogCheckError, "Unable to validate category deletion.");
    }

    if (activeBlogs && activeBlogs.length > 0) {
      return invalidInput("One or more categories are assigned to blogs.");
    }

    const { data, error } = await supabase
      .from("categories")
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      console.error("SUPABASE_CATEGORY_DELETE_ERROR:", error);
      return serviceError(error, "Unable to delete categories.");
    }
    if (!data?.length) return serviceFailure("Category not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "Category(ies) deleted successfully.");
  } catch (error) {
    return serviceError(error, "Unable to delete categories.");
  }
};

export const reassignAndRemove = async (id: number, reassignId: number) => {
  try {
    if (!Number.isInteger(id) || !Number.isInteger(reassignId) || id < 1 || reassignId < 1 || id === reassignId) return invalidInput("Valid, different category ids are required.");
    // 1. Move all blogs from category id to reassignId
    const { error: moveError } = await supabase
      .from("blogs")
      .update({ category_id: reassignId })
      .eq("category_id", id);

    if (moveError) {
      console.error("SUPABASE_REASSIGN_ERROR:", moveError);
         return serviceError(moveError, "Unable to reassign blogs.");
    }

    // 2. Delete category id
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .select("id");

    if (deleteError) {
      console.error("SUPABASE_CATEGORY_DELETE_AFTER_REASSIGN_ERROR:", deleteError);
         return serviceError(deleteError, "Blogs were reassigned but the category could not be deleted.");
    }

       return serviceSuccess(200, "Blogs reassigned and category deleted successfully!");
  } catch (error) {
       return serviceError(error, "Unable to reassign and delete category.");
  }
};
