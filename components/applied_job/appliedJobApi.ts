import config from "@/config";
import { IAppliedJobFilters } from "@/types/applied_job";
import { deleteFiles as deleteStorageFiles } from "../crud/uploadApi";

export const list = async(pageNo: number, pageSize: number, filters: IAppliedJobFilters) => {
  try {
     const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    const response = await fetch(`
      ${config.apiBaseUrl}/api/applied_job?page=${pageNo}&row=${pageSize}&filters=${encodedFilters}`)
    return await response.json();
  } catch (error) {
    console.log('APPLIEDJOB_LIST_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job/${id}`, { 
      cache: "no-store"
    })
    return await response.json();
  } catch (error) {
    console.log('APPLIEDJOB_READ_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    return await response.json();
  } catch (error) {
    console.log('APPLIEDJOB_DELETE_API:', error);
  }
}

export const deleteFiles = async(files: string[]) => {
  return deleteStorageFiles(files);
};