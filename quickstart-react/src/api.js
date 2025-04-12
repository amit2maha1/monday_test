const BASE_URL = "https://0be35e8ca081.apps-tunnel.monday.app"; // Replace with your actual base URL

async function fetchData(endpoint, method = 'GET', data = null) {
  const accessToken = localStorage.getItem("monday_access_token");
  if (!accessToken) {
    throw new Error("No access token available");
  }

  console.log('fetchData called with endpoint:', endpoint, 'method:', method);
  const url = `${BASE_URL}/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const get = (endpoint) => fetchData(endpoint);
export const post = (endpoint, data) => fetchData(endpoint, 'POST', data);
export const put = (endpoint, data) => fetchData(endpoint, 'PUT', data);
export const del = (endpoint) => fetchData(endpoint, 'DELETE');