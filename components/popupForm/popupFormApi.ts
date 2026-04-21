import config from "@/config";

export const list = async(pageNo: number, pageSize: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/popup-form?page=${pageNo}&row=${pageSize}`)
    const { data } = await response.json();  
    return data;                              
  } catch (error) {
    console.log('POPUP_FORM_LIST_API:', error);
  }
}
export const read = async(id: string) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/popup-form/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('POPUP_FORM_READ_API:', error);
  }
}

export const remove = async(ids: string[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/popup-form`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('POPUP_FORM_DELETE_API:', error);
  }
}