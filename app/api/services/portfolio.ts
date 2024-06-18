import { supabase } from "@/lib/supabase/query";

export const list = async(page:number = 1, limit:number = 10) => {
  try {
    const offset = (page-1) * limit;

    const { data, count } = await supabase
    .from("portfolio")
    .select('id, title, descp, image ', { count: "exact" })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

    if(data) return { success: true , data, count, status: 200 }
    return { success: false, msgText: "No records found!",  status: 404 }
  } catch(error) {
    throw error
  }
}

export const create = async (values: any) => {
  try {
    const { error } = await supabase
    .from('portfolio')
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
    .from('portfolio')
    .select()
    .filter('id', 'eq', id)
    .single();
  
    if(!data) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true , portfolio: data, status: 200 }
  } catch (error) {
    throw error
  }
} 

export const update = async (values: any, id: number) => {
  try {
    const { error } = await supabase
    .from('portfolio')
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
    .from("portfolio")
    .delete()
    .in('id', ids)

    if(error) return { success: false , msgText: "No record found!", status: 404 }
    return { success: true , msgText: "Deleted!", status: 200 }
  } catch(error) {
    throw error
  }
}