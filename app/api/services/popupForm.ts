import { supabase } from "@/lib/supabase/query";

export const list = async(page: number = 1, limit: number = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { data, count } = await (supabase as any)
      .from("popup_form")
      .select('id, name, email, phone, service, country, created_at', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if(data) return { success: true, data, count, status: 200 }
    return { success: false, msgText: "No records found!", status: 404 }
  } catch(error) {
    throw error
  }
}

export const read = async(id: number) => {
  try {
    const { data } = await (supabase as any)
      .from('popup_form')
      .select()
      .filter('id', 'eq', id)
      .single();

    if(!data) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true, popupForm: data, status: 200 }
  } catch(error) {
    throw error
  }
}

export const remove = async(ids: string[]) => { 
  try {
    const { error } = await (supabase as any)
      .from("popup_form")
      .delete()
      .in('id', ids)

    if(error) return { success: false, msgText: "No record found!", status: 404 }
    return { success: true, msgText: "Deleted!", status: 200 }
  } catch(error) {
    throw error
  }
}