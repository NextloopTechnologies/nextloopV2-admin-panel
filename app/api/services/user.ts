"use server"

import { ILogin } from "@/types/login"
import { supabase } from "@/lib/supabase/query";
import { IUser, IUserMutate } from "@/types/supabase";
import { invalidInput, serviceError, serviceFailure, serviceSuccess, ServiceResult } from "@/app/api/utils/response";

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


export const list = async(page:number = 1, limit:number = 10): Promise<ServiceResult<IUser[]>> => {
  try {
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 1000) return invalidInput<IUser[]>("Page must be at least 1 and row must be between 1 and 1000.");
    const offset = (page-1) * limit;

    const { data, count, error } = await supabase
      .from("user")
      .select('id, name, email ', { count: "exact" })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return serviceError<IUser[]>(error, "Unable to load users.");
    return serviceSuccess(200, data?.length ? "Users loaded successfully." : "No records found.", data || [], { count: count ?? 0 });
  } catch(error) {
    return serviceError<IUser[]>(error, "Unable to load users.");
  }
}

export const create = async (values: IUserMutate) => {
  try {
    if (!values?.name?.trim() || !values?.email?.trim() || !values?.password) return invalidInput("Name, email, and password are required.");

    const { data, error } = await supabase
    .from('user')
    .insert(values)
    .select()
    
    if (error) return serviceError(error, "Unable to create user.");
    return serviceSuccess(201, "User created successfully.", data);
  } catch (error) {
    console.error("CREATE_USER_ERROR", error);
    return serviceError(error, "Unable to create user.");
  }
}

export const userExists = async (email: string) => {
  try {
    if (!email?.trim()) return null;
    const { data, error } = await supabase
    .from('user')
    .select()
    .filter('email', 'eq', email)
    .single();
  
    if (error && error.code !== "PGRST116") console.error("USER_EXISTS_ERROR", error);
    return data ?? null;
  } catch (error) {
    console.error("USER_EXISTS_ERROR", error);
    return null;
  }
} 

export const remove = async(ids: number[]) => {
  try {
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !Number.isInteger(id) || id < 1)) return invalidInput("At least one valid user id is required.");
    const { data, error } = await supabase
    .from("user")
    .delete()
    .in('id', ids)
    .select('id')

    if (error) return serviceError(error, "Unable to delete users.");
    if (!data?.length) return serviceFailure("User not found.", 404, "NOT_FOUND");
    return serviceSuccess(200, "User(s) deleted successfully.", data);
  } catch(error) {
    return serviceError(error, "Unable to delete users.");
  }
}