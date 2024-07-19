import config from "@/config";

export const list = async() => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('IDEA_LIST_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('IDEA_READ_API:', error);
  }
}

export const remove = async(ids: any) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/idea`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('IDEA_DELETE_API:', error);
  }
}