"use server"

import { ILogin } from "@/types/login"

export async function validateCredentials({ username, password }: ILogin) {
    return (
        username === process.env.ADMIN_USERNAME &&
        (await isValidPassword(
          password,
          process.env.HASHED_ADMIN_PASSWORD as string
        ))
    )
}

export async function isValidPassword(
    password: string,
    hashedPassword: string
  ) {
    return (await hashPassword(password)) === hashedPassword
  }
  
async function hashPassword(password: string) {
    
    const arrayBuffer = await crypto.subtle.digest(
      "SHA-512",
      new TextEncoder().encode(password)
    )
  
    return Buffer.from(arrayBuffer).toString("base64")
}