import config from "@/config";
import { fetchApi } from "../crud/apiResponse";

const apiPath = (path: string) => `${config.apiBaseUrl || ""}/api${path}`;

export async function list(page: number, row: number) {
  return fetchApi(apiPath(`/user?page=${page}&row=${row}`));
}

export async function remove(ids: number[]) {
  return fetchApi(apiPath(`/user`), {
    method: "DELETE",
    body: JSON.stringify(ids),
    headers: { "Content-Type": "application/json" },
  });
}

export async function create(payload: { name: string; email: string; password: string }) {
  return fetchApi(apiPath(`/user`), {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}

export async function login(payload: { username: string; password: string }) {
  return fetchApi(apiPath(`/user`), {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
}