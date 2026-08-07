import config from "@/config";

export const list = async (pageNo?: number, pageSize?: number, searchQuery?: string) => {
  try {
    let url = `${config.apiBaseUrl}/api/category`;
    const params = new URLSearchParams();
    if (pageNo) params.append('page', pageNo.toString());
    if (pageSize) params.append('row', pageSize.toString());
    if (searchQuery) params.append('q', searchQuery);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, { cache: "no-store" });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_LIST_API_ERROR:', error);
    return { success: false, data: [], count: 0 };
  }
};

export const create = async (payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/category`, {
      method: 'POST',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_CREATE_API_ERROR:', error);
    return { success: false, msgText: "Failed to create category." };
  }
};

export const read = async (id: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/category/${id}`, {
      cache: "no-store"
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_READ_API_ERROR:', error);
    return { success: false, msgText: "Failed to read category." };
  }
};

export const update = async (payload: FormData) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/category`, {
      method: 'PUT',
      body: payload,
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_UPDATE_API_ERROR:', error);
    return { success: false, msgText: "Failed to update category." };
  }
};

export const remove = async (ids: number[]) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/category`, {
      method: "DELETE",
      body: JSON.stringify(ids)
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_DELETE_API_ERROR:', error);
    return { success: false, msgText: "Failed to delete category." };
  }
};

export const reassignAndRemove = async (id: number, reassignId: number) => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/category`, {
      method: "DELETE",
      body: JSON.stringify({ id, reassignId })
    });
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('CATEGORY_REASSIGN_AND_DELETE_API_ERROR:', error);
    return { success: false, msgText: "Failed to reassign and delete category." };
  }
};
