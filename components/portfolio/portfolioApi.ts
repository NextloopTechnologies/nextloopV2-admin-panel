import config from "@/config";

export const list = async() => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`)
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('PORTFOLIO_LIST_API:', error);
  }
}

export const create = async(payload: any) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, {
      method: 'POST',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('PORTFOLIO_CREATE_API:', error);
  }
}

export const read = async(id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio/${id}`, { 
      cache: "no-store"
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('PORTFOLIO_READ_API:', error);
  }
}

export const update = async(payload: any) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, {
      method: 'PUT',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('PORTFOLIO_UPDATE_API:', error);
  }
}

export const remove = async(ids: any) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/portfolio`, { 
      method: "DELETE",
      body: JSON.stringify(ids)
    })
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.log('PORTFOLIO_DELETE_API:', error);
  }
}