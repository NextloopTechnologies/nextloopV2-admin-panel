import config from "@/config";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/testimonial?page=${pageNo}&row=${pageSize}`)
    return await response.json();
  } catch (error) {
    console.log('TESTIMONIAL_LIST_API:', error);
  }
}

export const create = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/testimonial`, {
      method: 'POST',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('TESTIMONIAL_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/testimonial/${id}`, { 
      cache: "no-store"
    })
    return await response.json();
  } catch (error) {
    console.log('TESTIMONIAL_READ_API:', error);
  }
}

export const update = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/testimonial`, {
      method: 'PUT',
      body: payload,
    });
    return await response.json();
  } catch (error) {
    console.log('TESTIMONIAL_UPDATE_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/testimonial`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    return await response.json();
  } catch (error) {
    console.log('TESTIMONIAL_DELETE_API:', error);
  }
}