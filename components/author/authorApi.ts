import config from "@/config";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author?page=${pageNo}&row=${pageSize}`)
    return await response.json();
  } catch (error) {
    console.log('AUTHOR_LIST_API:', error);
  }
}

export const create = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author`, {
      method: 'POST',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('AUTHOR_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author/${id}`, { 
      cache: "no-store"
    })
    return await response.json();
  } catch (error) {
    console.log('AUTHOR_READ_API:', error);
  }
}

export const update = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author`, {
      method: 'PUT',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('AUTHOR_UPDATE_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    return await response.json();
  } catch (error) {
    console.log('AUTHOR_DELETE_API:', error);
  }
}