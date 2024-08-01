import config from "@/config";

export const list = async() => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_LIST_API:', error);
  }
}

export const create = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job`, {
      method: 'POST',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_READ_API:', error);
  }
}

export const update = async(payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job`, {
      method: 'PUT',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_UPDATE_API:', error);
  }
}

export const remove = async(ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/applied_job`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('APPLIEDJOB_DELETE_API:', error);
  }
}