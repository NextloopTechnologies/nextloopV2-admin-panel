import config from "@/config";
import { fetchApi } from "../crud/apiResponse";

const apiPath = (path: string) => `${config.apiBaseUrl || ""}/api${path}`;

export const list = async(pageNo: number, pageSize: number) => {
  return fetchApi(apiPath(`/popup-form?page=${pageNo}&row=${pageSize}`));
}
export const read = async(id: string) => {
  return fetchApi(apiPath(`/popup-form/${id}`));
}

export const remove = async(ids: string[]) => {
  return fetchApi(apiPath(`/popup-form`), {
      method: "DELETE",
      body: JSON.stringify(ids)
  });
}