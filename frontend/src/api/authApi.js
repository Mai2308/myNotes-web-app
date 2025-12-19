const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const register = async (payload) => {
  const url = BASE.startsWith("http") ? `${BASE}/api/users/register` : `/api/users/register`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Registration failed with status ${res.status}`);
  }
  return data;
};

export const login = async (payload) => {
  const url = BASE.startsWith("http") ? `${BASE}/api/users/login` : `/api/users/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Login failed with status ${res.status}`);
  }
  return data;
};
