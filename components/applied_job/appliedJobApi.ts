import config from "@/config";
import { IAppliedJobFilters } from "@/types/applied_job";

export const list = async(pageNo: number, pageSize: number, filters: IAppliedJobFilters) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job?page=${pageNo}&row=${pageSize}&filters=${JSON.stringify(filters)}`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_LIST_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
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
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_DELETE_API:', error);
  }
}