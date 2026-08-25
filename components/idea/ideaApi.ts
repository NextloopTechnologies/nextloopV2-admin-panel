import config from "@/config";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea?page=${pageNo}&row=${pageSize}`)
    return await response.json();
  } catch (error) {
    console.log('IDEA_LIST_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea/${id}`, { 
      cache: "no-store"
    })
    return await response.json();
  } catch (error) {
    console.log('IDEA_READ_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    return await response.json();
  } catch (error) {
    console.log('IDEA_DELETE_API:', error);
  }
}