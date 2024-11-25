import config from "@/config";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/enquiry?page=${pageNo}&row=${pageSize}`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('ENQUIRY_LIST_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/enquiry/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('ENQUIRY_READ_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/enquiry`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('ENQUIRY_DELETE_API:', error);
  }
}