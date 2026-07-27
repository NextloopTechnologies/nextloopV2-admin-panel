import config from "@/config";

export const list = async(pageNo:number, pageSize:number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog?page=${pageNo}&row=${pageSize}`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_LIST_API:', error);
  }
}

export const create = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog`, {
      method: 'POST',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_READ_API:', error);
  }
}

export const update = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog`, {
      method: 'PUT',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_UPDATE_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_DELETE_API:', error);
  }
}

export const search = async (query: string) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog/search?q=${encodeURIComponent(query)}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_SEARCH_API:', error);
    return { success: false, data: [] };
  }
}