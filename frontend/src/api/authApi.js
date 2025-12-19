const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const register = async (payload) => {
  const url = BASE.startsWith("http") ? `${BASE}/api/users/register` : `/api/users/register`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const login = async (payload) => {
  const url = BASE.startsWith("http") ? `${BASE}/api/users/login` : `/api/users/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};
