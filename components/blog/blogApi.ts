import config from "@/config";

export const list = async() => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/blog`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('BLOG_LIST_API:', error);
  }
}

export const create = async(payload: any) => {
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

export const update = async(payload: any) => {
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

export const remove = async(ids: any) => {
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