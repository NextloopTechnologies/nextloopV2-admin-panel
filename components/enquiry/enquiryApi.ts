import config from "@/config";
import { fetchApi } from "../crud/apiResponse";

const apiPath = (path: string) => `${config.apiBaseUrl || ""}/api${path}`;

export const list = async(pageNo: number, pageSize: number) => {
  return fetchApi(apiPath(`/enquiry?page=${pageNo}&row=${pageSize}`));
}

export const read = async(id: number) => {
  return fetchApi(apiPath(`/enquiry/${id}`));
}

export const remove = async(ids: number[]) => {
  return fetchApi(apiPath(`/enquiry`), {
      method: "DELETE",
      body: JSON.stringify(ids)
  });
}