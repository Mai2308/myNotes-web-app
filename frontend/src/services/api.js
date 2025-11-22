// src/services/api.js

const BASE_URL = "http://localhost:5000/api/auth"; // backend url

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function signupUser(email, password) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
