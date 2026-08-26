import config from "@/config";
import { deleteFiles as deleteStorageFiles } from "../crud/uploadApi";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio?page=${pageNo}&row=${pageSize}`)
    return await response.json();
  } catch (error) {
    console.log('PORTFOLIO_LIST_API:', error);
  }
}

export const create = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, {
      method: 'POST',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('PORTFOLIO_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio/${id}`, { 
      cache: "no-store"
    })
    return await response.json();
  } catch (error) {
    console.log('PORTFOLIO_READ_API:', error);
  }
}

export const update = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, {
      method: 'PUT',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('PORTFOLIO_UPDATE_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    return await response.json();
  } catch (error) {
    console.log('PORTFOLIO_DELETE_API:', error);
  }
}

export const deleteFiles = async(files: string[]) => {
  return deleteStorageFiles(files);
};