const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const register = async (payload) => {
  const res = await fetch(`${BASE}/api/users/register`, {
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
  const res = await fetch(`${BASE}/api/users/login`, {
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
