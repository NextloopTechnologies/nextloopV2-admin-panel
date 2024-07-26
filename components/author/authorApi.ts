import config from "@/config";

export const list = async() => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author`)
    const { data } = await response.json();
    return data;
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
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('AUTHOR_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/author/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
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
    const { data } = await response.json();
    return data;
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
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('AUTHOR_DELETE_API:', error);
  }
}