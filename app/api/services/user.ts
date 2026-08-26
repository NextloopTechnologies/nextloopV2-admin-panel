"use server"

import { ILogin } from "@/types/login"
import { supabase } from "@/lib/supabase/query";
import { IUser, IUserMutate } from "@/types/supabase";

export async function validateCredentials({ username, password }: ILogin) {

  const isUserExists = await userExists(username);   
  if(isUserExists != null) {
    return (
      username === isUserExists.email &&
      (await isValidPassword(
        password,
        isUserExists.password as string
      ))
    )
  }
  return false
}

export async function isValidPassword(
    password: string,
    hashedPassword: string
  ) {
    return (await hashPassword(password)) === hashedPassword
  }
  
export async function hashPassword(password: string) {
    
    const arrayBuffer = await crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(password)
    )
  
    return Buffer.from(arrayBuffer).toString("base64")
}


export const list = async(page:number = 1, limit:number = 10) => {
  try {
    const offset = (page-1) * limit;

    const { data, count } = await supabase
      .from("user")
      .select('id, name, email ', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    return { data, count }
  } catch(error) {
    throw error
  }
}

export const create = async (values: IUserMutate) => {
  try {

    const { data } = await supabase
    .from('user')
    .insert(values)
    .select()
    
    return data
  } catch (error) {
    console.log("CREATE_USER_ERROR", error);
    
    throw error
  }
}

export const userExists = async (email: string) => {
  try {
    const { data } = await supabase
    .from('user')
    .select()
    .filter('email', 'eq', email)
    .single();
  
    return data 
  } catch (error) {
    throw error
  }
} 

export const remove = async(ids: number[]) => {
  try {
    const { status } = await supabase
    .from("user")
    .delete()
    .in('id', ids)

    return status
  } catch(error) {
    throw error
  }
}